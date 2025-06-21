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

        $filteredPaidSales = Cache::remember("filtered_paid_sales_{$cacheKeySuffix}", 600, fn() => $this->getSalesBetween($from, $to));

        $unpaidSales = Cache::remember("unpaid_sales_{$cacheKeySuffix}", 600, function () {
            return SaleTransaction::where('status', 'unpaid')
                ->selectRaw('SUM(total_amount_usd) as total_amount, COUNT(*) as count')
                ->first();
        });

        $topProducts = Cache::remember("top_products_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            return SaleTransactionDetail::whereHas('saleTransaction', function ($query) use ($from, $to) {
                $query->where('status', 'paid')->whereBetween('created_at', [$from, $to]);
            })
                ->with(['product:product_id,product_name', 'variant:variant_id,variant_code'])
                ->select('product_id', 'variant_id', DB::raw('SUM(quantity) as total_quantity'))
                ->groupBy('product_id', 'variant_id')
                ->orderByDesc('total_quantity')
                ->take(5)
                ->get()
                ->map(function ($detail) {
                    return [
                        'label' => $detail->variant->variant_code ?? $detail->product->product_name ?? 'N/A',
                        'quantity' => $detail->total_quantity,
                    ];
                });
        });

        $cogs = Cache::remember("cogs_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            return SaleTransactionDetail::whereHas('saleTransaction', function ($query) use ($from, $to) {
                $query->where('status', 'paid')->whereBetween('created_at', [$from, $to]);
            })
                ->with(['product:product_id,cost_price_usd', 'variant:variant_id,cost_price_usd'])
                ->get()
                ->sum(function ($detail) {
                    $cost = $detail->variant->cost_price_usd
                        ?? $detail->product->cost_price_usd
                        ?? 0;
                    return $detail->quantity * $cost;
                });
        });

        $expenses = Cache::remember("expenses_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            return Expense::whereBetween('expense_date', [$from, $to])->sum('amount');
        });

        $profitOrLoss = $filteredPaidSales - $cogs - $expenses;

        $categorySalesToday = Cache::remember("category_sales_{$cacheKeySuffix}", 600, function () use ($from, $to) {
            return DB::table('sale_transaction_details as std')
                ->join('sale_transactions as st', 'st.transaction_id', '=', 'std.sale_transaction_id')
                ->join('product_variants as pv', 'pv.variant_id', '=', 'std.variant_id')
                ->join('products as p', 'p.product_id', '=', 'pv.product_id')
                ->join('categories as c', 'c.category_id', '=', 'p.category_id')
                ->where('st.status', 'paid')
                ->whereBetween('st.created_at', [$from, $to])
                ->select('c.category_id', 'c.category_name', DB::raw('SUM(std.quantity) as total_sold'))
                ->groupBy('c.category_id', 'c.category_name')
                ->orderByDesc('total_sold')
                ->get();
        });

        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'unpaidSales' => $unpaidSales,
            'topProducts' => $topProducts,
            'profitOrLoss' => $profitOrLoss,
            'categorySalesToday' => $categorySalesToday,
        ]);
    }


    private function getSalesBetween($from, $to): float
    {
        return SaleTransaction::where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount_usd');
    }
}
