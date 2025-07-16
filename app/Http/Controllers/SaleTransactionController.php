<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\SaleTransaction;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\SaleTransactionResource;

class SaleTransactionController extends Controller
{
    public function index(Request $request)
    {
        $saleTransactions = SaleTransaction::with('customer')->when($request->search, function ($query, $search) {
            $query->whereHas('customer', function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            });
        })->when($request->status, function ($query, $status) {
            $query->where('status', $status);
        })->latest()->paginate(10);

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

    public function detail($id)
    {
        $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant', 'customer')->find($id)->toResource();
        return Inertia::render('admin/sale-transaction/detail', [
            'saleTransaction' => $saleTransaction,
        ]);
    }

    public function edit($id)
    {
        $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant', 'customer')->find($id)->toResource();
        return Inertia::render('admin/sale-transaction/edit', [
            'saleTransaction' => $saleTransaction,
            'customers' => Customer::select('id', 'name')->get(),
        ]);
    }

    public function printInvoice($saleTransactionId)
    {
        $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant', 'customer')->find($saleTransactionId)->toResource();
        // return Inertia::render('admin/sale-transaction/print-invoice', [
        //     'saleTransaction' => $saleTransaction,
        // ]);
        return view('print_invoice', [
            'saleTransaction' => $saleTransaction,
        ]);
    }
}
