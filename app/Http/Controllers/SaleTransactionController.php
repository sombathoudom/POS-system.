<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\SaleTransaction;

class SaleTransactionController extends Controller
{
    public function index()
    {
        $saleTransactions = SaleTransaction::with('customer')->latest()->paginate(10);

        return Inertia::render('admin/sale-transaction/index', [
            'saleTransactions' => $saleTransactions,
        ]);
    }
}
