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

        return Inertia::render('dashboard', [
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
            'unpaidSales' => $unpaidSales,
            'topProducts' => [],
            'profitOrLoss' => 0,
            'categorySalesToday' => [],
        ]);
    }


    private function getSalesBetween($from, $to): float
    {
        return SaleTransaction::where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount_usd');
    }
}
