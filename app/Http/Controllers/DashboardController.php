<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Expense;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\SaleTransaction;
use Illuminate\Support\Facades\DB;
use App\Models\SaleTransactionDetail;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(Request $request)
    {

        $today = Carbon::now()->startOfDay();
        $monthStart = Carbon::now()->startOfMonth();
        $yearStart = Carbon::now()->startOfYear();
        $now = Carbon::now()->endOfDay();

        $from = $request->input('date.from')
            ? Carbon::parse($request->input('date.from'))->startOfDay()
            : $today;

        $to = $request->input('date.to')
            ? Carbon::parse($request->input('date.to'))->endOfDay()
            : $now;

        $cacheKeySuffix = $from->format('Ymd') . '_' . $to->format('Ymd');

        $dailySales = Cache::remember("daily_sales_{$cacheKeySuffix}", 600, fn() => $this->getSalesBetween($today, $now));
        $monthlySales = Cache::remember("monthly_sales_{$cacheKeySuffix}", 600, fn() => $this->getSalesBetween($monthStart, $now));
        $yearlySales = Cache::remember("yearly_sales_{$cacheKeySuffix}", 600, fn() => $this->getSalesBetween($yearStart, $now));

        $unpaidSales = Cache::remember("unpaid_sales_{$cacheKeySuffix}", 600, function () {
            return SaleTransaction::where('status', 'unpaid')
                ->selectRaw('SUM(total_amount_usd) as total_amount, COUNT(*) as count')
                ->first();
        });

        $totalOrders = Cache::remember("total_orders_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            return SaleTransaction::where('status', 'paid')
                ->whereBetween('transaction_date', [$from, $to])
                ->count();
        });

        $grossProfit = Cache::remember("gross_profit_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            $sales = SaleTransaction::where('status', 'paid')
                ->whereBetween('transaction_date', [$from, $to])
                ->sum('total_amount_usd');

            $cogs = SaleTransactionDetail::whereHas('saleTransaction', function ($query) {
                $query->where('status', 'paid');
            })
            ->whereBetween('created_at', [$from, $to])
            ->with(['product:product_id,cost_price_usd', 'variant:variant_id,cost_price_usd'])
            ->get()
            ->sum(function ($detail) {
                $cost = $detail->variant->cost_price_usd ?? $detail->product->cost_price_usd ?? 0;
                return $detail->quantity * $cost;
            });
            return $sales - $cogs; // Gross Profit
        });

        $netProfit = Cache::remember("net_profit_{$cacheKeySuffix}", 600, function () use ($from, $to, $grossProfit) {
            $expenses = Expense::whereBetween('expense_date', [$from, $to])->sum('amount');
            return $grossProfit - $expenses; // Net Profit = Gross Profit - Expenses
        });

        $monthlySaleChart = Cache::remember("monthly_sale_{$cacheKeySuffix}", 3600, function () {
            return  SaleTransaction::where('status', 'paid')
            ->whereBetween('transaction_date', [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()])
            ->selectRaw('
                MONTH(transaction_date) as month_number,
                MONTHNAME(transaction_date) as month_name,
                SUM(total_amount_usd) as total_amount,
                COUNT(*) as count
            ')
            ->groupBy('month_number', 'month_name')
            ->orderBy('month_number')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month_name,
                    'total_amount' => $item->total_amount,
                    'count' => $item->count,
                ];
            });
        });

        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'unpaidSales' => $unpaidSales,
            'totalOrders' => $totalOrders,
            'revenue' => $netProfit,
            'monthlySaleChart' => $monthlySaleChart,
        ]);
    }


    private function getSalesBetween($from, $to): float
    {
        return SaleTransaction::where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount_usd');
    }
}
