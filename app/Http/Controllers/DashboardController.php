<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\SaleTransaction;
use App\Models\SaleTransactionDetail;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $dailySales = SaleTransaction::where('status', 'paid')->whereDate('created_at', now()->today())->sum('total_amount_usd');
        $monthlySales = SaleTransaction::where('status', 'paid')->whereMonth('created_at', now()->month)->sum('total_amount_usd');
        $yearlySales = SaleTransaction::where('status', 'paid')->whereYear('created_at', now()->year)->sum('total_amount_usd');


        $topProducts = SaleTransactionDetail::with('product')
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->take(5)
            ->get();

        $profitOrLoss = SaleTransaction::whereDate('created_at', now()->today())->sum('total_amount_usd') - PurchaseOrder::whereDate('created_at', now()->today())->sum('total_amount');

        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'profitOrLoss' => $profitOrLoss,
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
