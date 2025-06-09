<?php

namespace App\Http\Controllers;

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
        // dd($request->all());
        $from = $request->date['from'] ?? now()->startOfDay();
        $to = $request->date['to'] ?? now()->endOfDay();

        $dailySales = SaleTransaction::where('status', 'paid')->when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('created_at', [$from, $to]);
        })->sum('total_amount_usd');

        $monthlySales = SaleTransaction::where('status', 'paid')->when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('created_at', [$from, $to]);
        })->sum('total_amount_usd');

        $yearlySales = SaleTransaction::where('status', 'paid')->when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('created_at', [$from, $to]);
        })->sum('total_amount_usd');

        $unpaidSales = SaleTransaction::where('status', 'unpaid')
            ->selectRaw('SUM(total_amount_usd) as total_amount, COUNT(*) as count')
            ->when($from && $to, function ($query) use ($from, $to) {
                return $query->whereBetween('created_at', [$from, $to]);
            })
            ->first();

        $topProducts = SaleTransactionDetail::with('product')
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->take(5)
            ->get();

        $profitOrLoss = SaleTransaction::where('status', 'paid')->when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('created_at', [$from, $to]);
        })->sum('total_amount_usd') - PurchaseOrder::when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('created_at', [$from, $to]);
        })->sum('total_amount') - Expense::when($from && $to, function ($query) use ($from, $to) {
            return $query->whereBetween('expense_date', [$from, $to]);
        })->sum('amount');

        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'profitOrLoss' => $profitOrLoss,
            'unpaidSales' => $unpaidSales->total_amount,
            'unpaidSalesCount' => $unpaidSales->count,
            'topProducts' => $topProducts->map(function ($product) {
                return [
                    'name' => $product->product->product_name,
                    'sales' => $product->total_quantity, // Total quantity sold
                    'revenue' => $product->total_quantity * ($product->product->sell_price_usd ?? 0), // Revenue calculation
                ];
            }),
        ]);
    }
}
