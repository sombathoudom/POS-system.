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
        $date = $request->date ?? now()->today();

        $dailySales = SaleTransaction::where('status', 'paid')->whereDate('created_at', now()->today())->sum('total_amount_usd');
        $monthlySales = SaleTransaction::where('status', 'paid')->whereMonth('created_at', now()->month)->sum('total_amount_usd');
        $yearlySales = SaleTransaction::where('status', 'paid')->whereYear('created_at', now()->year)->sum('total_amount_usd');

        $unpaidSales = SaleTransaction::where('status', 'unpaid')
            ->selectRaw('SUM(total_amount_usd) as total_amount, COUNT(*) as count')
            ->first();

        $topProducts = SaleTransactionDetail::with('product')
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->take(5)
            ->get();

        $profitOrLoss = SaleTransaction::where('status', 'paid')->whereDate('created_at', now()->today())->sum('total_amount_usd') - PurchaseOrder::whereDate('created_at', now()->today())->sum('total_amount') - Expense::whereDate('expense_date', now()->today())->sum('amount');

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
