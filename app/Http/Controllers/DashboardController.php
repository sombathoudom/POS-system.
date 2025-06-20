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

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::now()->startOfDay();
        $monthStart = Carbon::now()->startOfMonth();
        $yearStart = Carbon::now()->startOfYear();
        $now = Carbon::now()->endOfDay();

        // User-defined or fallback date filter for detailed stats
        $from = $request->input('date.from')
            ? Carbon::parse($request->input('date.from'))->startOfDay()
            : $today;

        $to = $request->input('date.to')
            ? Carbon::parse($request->input('date.to'))->endOfDay()
            : $now;

        // Time-based summaries (static ranges)
        $dailySales = $this->getSalesBetween($today, $now);
        $monthlySales = $this->getSalesBetween($monthStart, $now);
        $yearlySales = $this->getSalesBetween($yearStart, $now);

        // Sales based on user filter (for profit calculation)
        $filteredPaidSales = $this->getSalesBetween($from, $to);

        // Unpaid orders (optional: consider filtering unpaid by date if meaningful)
        $unpaidSales = SaleTransaction::where('status', 'unpaid')
            ->selectRaw('SUM(total_amount_usd) as total_amount, COUNT(*) as count')
            ->first();

        // Top selling products (consider filtering to match $from-$to if needed)
        $topProducts = SaleTransactionDetail::whereHas('saleTransaction', function ($query) use ($from, $to) {
            $query->where('status', 'paid')
                ->whereBetween('created_at', [$from, $to]);
        })
            ->with(['product:product_id,product_name', 'variant:variant_id,variant_code']) // adjust fields as needed
            ->select(
                'product_id',
                'variant_id',
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->groupBy('product_id', 'variant_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get()
            ->map(function ($detail) {
                return [
                    'label' => $detail->variant->variant_code ?? $detail->product->product_name ?? 'Unnamed',
                    'quantity' => $detail->total_quantity,
                ];
            });


        // COGS for filtered date range
        $cogs = SaleTransactionDetail::whereHas('saleTransaction', function ($query) use ($from, $to) {
            $query->where('status', 'paid')
                ->whereBetween('created_at', [$from, $to]);
        })
            ->with(['product:product_id,cost_price_usd', 'variant:variant_id,cost_price_usd'])
            ->get()
            ->sum(function ($detail) {
                $cost = $detail->variant->cost_price_usd
                    ?? $detail->product->cost_price_usd
                    ?? 0;

                return $detail->quantity * $cost;
            });

        // Expenses for same filter range
        $expenses = Expense::whereBetween('expense_date', [$from, $to])->sum('amount');

        // Profit or Loss
        $profitOrLoss = $filteredPaidSales - $cogs - $expenses;


        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'unpaidSales' => $unpaidSales,
            'topProducts' => $topProducts,
            'profitOrLoss' => $profitOrLoss,
        ]);

        // return Inertia::render('dashboard', [
        //     'dailySales' => $dailySales,
        //     'monthlySales' => $monthlySales,
        //     'yearlySales' => $yearlySales,
        //     'profitOrLoss' => $profitOrLoss,
        //     'unpaidSales' => $unpaidSales->total_amount,
        //     'unpaidSalesCount' => $unpaidSales->count,
        //     'topProducts' => [],
        //     // 'topProducts' => $topProducts->map(function ($product) {
        //     //     return [
        //     //         'name' => $product->product->product_name,
        //     //         'sales' => $product->total_quantity, // Total quantity sold
        //     //         'revenue' => $product->total_quantity * ($product->product->sell_price_usd ?? 0), // Revenue calculation
        //     //     ];
        //     // }),
        // ]);
    }

    private function getSalesBetween($from, $to): float
    {
        return SaleTransaction::where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount_usd');
    }
}
