<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\SaleTransaction;
use Illuminate\Support\Facades\DB;

class SaleTransactionController extends Controller
{
    public function index()
    {
        $saleTransactions = SaleTransaction::with('customer')->latest()->paginate(10);

        return Inertia::render('admin/sale-transaction/index', [
            'saleTransactions' => $saleTransactions,
        ]);
    }

    public function markAsPaid($id)
    {
        $saleTransaction = SaleTransaction::find($id);
        $saleTransaction->status = 'paid';
        $saleTransaction->save();
        return to_route('sale-transaction.index')->with('success', 'Sale transaction marked as paid');
    }

    public function markAsCancelled($id)
    {
        try {
            DB::beginTransaction();
            $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant')->find($id);
            $saleTransaction->saleTransactionDetails->each(function ($detail) {
                if ($detail->variant_id) {
                    $variant = $detail->variant;
                    $variant->quantity += $detail->quantity;
                    $variant->save();
                } else {
                    $product = $detail->product;
                    $product->quantity += $detail->quantity;
                    $product->save();
                }
            });
            $saleTransaction->status = 'cancelled';
            $saleTransaction->save();
            DB::commit();
            return to_route('sale-transaction.index')->with('success', 'Sale transaction marked as cancelled');
        } catch (\Throwable $th) {
            DB::rollBack();
            return to_route('sale-transaction.index')->with('error', 'Sale transaction marked as cancelled');
        }
    }
}
