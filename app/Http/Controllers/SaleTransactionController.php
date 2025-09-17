<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\SaleTransaction;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SaleTransactionResource;
use App\Models\SaleTransactionDetail;

class SaleTransactionController extends Controller
{
    public function index(Request $request)
    {
        $saleTransactions = SaleTransaction::with('customer')->when($request->search, function ($query, $search) {
            $query->whereHas('customer', function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
                $query->orWhere('phone', 'like', '%' . $search . '%');
            });
        })->when($request->status, function ($query, $status) {
            $query->where('status', $status);
        })->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/sale-transaction/index', [
            'saleTransactions' => $saleTransactions,
        ]);
    }

    public function markAsPaid($id)
    {
        $saleTransaction = SaleTransaction::find($id);
        $saleTransaction->status = 'paid';
        $saleTransaction->save();
        return back()->with('success', 'Sale transaction marked as paid');
    }

    public function markAsCancelled($id)
    {
        try {
            DB::beginTransaction();

            $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant')
                ->find($id);

            if (!$saleTransaction) {
                throw new \Exception('Sale transaction not found');
            }

            if ($saleTransaction->status === 'cancelled') {
                throw new \Exception('Sale transaction is already cancelled');
            }

            // Create offsetting transaction details for each item
            $saleTransaction->saleTransactionDetails->each(function ($detail) {
                // Create a new detail with positive calculation_value to offset the sale
                SaleTransactionDetail::create([
                    'sale_transaction_id' => $detail->sale_transaction_id,
                    'product_id' => $detail->product_id,
                    'variant_id' => $detail->variant_id,
                    'quantity' => $detail->quantity,
                    'calculation_value' => '+' . $detail->quantity, // Positive value to offset negative
                    'calculation_type' => 'increase',
                    'unit_price_usd' => $detail->unit_price_usd,
                    'unit_price_khr' => $detail->unit_price_khr,
                    'return_date' => now(),
                    'type' => 'return'
                ]);
            });

            // Update transaction status
            $saleTransaction->status = 'cancelled';
            $saleTransaction->save();

            DB::commit();
            return back()->with('success', 'Sale transaction marked as cancelled');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', $th->getMessage());
        }
    }

    public function detail($id)
    {
        $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.variant', 'customer')->find($id)->toResource();

        return Inertia::render('admin/sale-transaction/detail', [
            'saleTransaction' => $saleTransaction,
        ]);
    }

    public function edit($id, Request $request)
    {
        $saleTransaction = SaleTransaction::with('saleTransactionDetails', 'saleTransactionDetails.product', 'saleTransactionDetails.product.images', 'saleTransactionDetails.variant', 'saleTransactionDetails.variant.images', 'customer')->find($id)->toResource(SaleTransactionResource::class);

        return Inertia::render('admin/sale-transaction/edit', [
            'saleTransaction' => $saleTransaction,
            'customers' => Customer::select('id', 'name')->get(),
        ]);
    }

    public function searchProductsEdit(Request $request)
    {
        $products = Product::with(['category', 'variants', 'images'])
            ->where(
                function ($query) {
                    $query->where(function ($q) {
                        $q->where('quantity', '>', 0)
                            ->whereNull('deleted_at');
                    })
                        ->orWhereHas('variants', function ($q) {
                            $q->where('quantity', '>', 0)
                                ->whereNull('deleted_at');
                        });
                }
            )
            ->when($request->search, function ($query) use ($request) {
                $query->where('product_name', 'like', '%' . $request->search . '%')
                    ->orWhere('product_code', 'like', '%' . $request->search . '%')
                    ->orWhereHas('variants', function ($query) use ($request) {
                        $query->Where('variant_code', 'like', '%' . $request->search . '%');
                    });
            })
            ->latest()
            ->paginate(10);

        return ProductResource::collection($products);
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
