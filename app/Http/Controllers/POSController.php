<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Utils\Helpers;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\SaleTransaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\PosResource;
use App\Models\SaleTransactionDetail;

class POSController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'variants', 'images', 'variants.images'])->where(
            function ($query) {
                $query->where([
                    ['quantity', '>', 0],
                    ['deleted_at', null]
                ])->orWhereHas('variants', function ($query) {
                    $query->where([
                        ['quantity', '>', 0],
                        ['deleted_at', null]
                    ]);
                });
            }
        )->when(request()->search, function ($query) {
            $query->where('product_name', 'like', '%' . request()->search . '%')
                ->orWhere('product_code', 'like', '%' . request()->search . '%')
                ->orWhereHas('variants', function ($query) {
                    $query->where('variant_name', 'like', '%' . request()->search . '%')
                        ->orWhere('variant_code', 'like', '%' . request()->search . '%');
                });
        })->when(request()->category, function ($query) {
            $query->where('category_id', request()->category);
        })->latest()->paginate(10)->withQueryString();

        // Transform and flatten the products
        $flattenedProducts = $products->getCollection()->flatMap(function ($product) {
            return (new PosResource($product))->toArray(request());
        });

        // Create a new collection with the flattened products
        $products->setCollection($flattenedProducts);



        return Inertia::render('admin/pos/pos', [
            'productss' => $products,
            'categories' => Category::select('category_id', 'category_name')->get()
        ]);
    }

    public function saleProducts(Request $request)
    {
        try {
            DB::beginTransaction();
            $products = $request->all();

            $saleTransaction = SaleTransaction::create([
                'customer_id' => $products['customer_id'],
                'invoice_number' => $this->generateInvoiceNumber(),
                'user_id' => 1,
                'currency' => 'USD',
                'total_amount_usd' => $products['total'],
                'total_amount_khr' => $products['total'] * 4100,
                'delivery_fee' => $products['deliveryFee'],
                'transaction_date' => now('Asia/Phnom_Penh')->format('Y-m-d H:i:s'),
            ]);

            $product = collect($products['products'])->map(function ($product) use ($saleTransaction) {
                $productData = Product::find($product['id']);
                if (!$productData) {
                    return response()->json(['message' => 'Product not found'], 404);
                }
                if ($productData->quantity < $product['quantity']) {
                    return response()->json(['message' => 'Product quantity is not enough'], 400);
                }
                if ($productData->variants->count() > 0) {
                    $variant = $productData->variants->where('variant_id', $product['variant_id'])->first();
                    if (!$variant) {
                        return response()->json(['message' => 'Variant not found'], 404);
                    }
                    if ($variant->quantity < $product['quantity']) {
                        return response()->json(['message' => 'Variant quantity is not enough'], 400);
                    }
                    $variant->quantity = $variant->quantity - $product['quantity'];
                    $variant->save();

                    SaleTransactionDetail::create([
                        'sale_transaction_id' => $saleTransaction->transaction_id,
                        'product_id' => $productData->product_id,
                        'variant_id' => $variant->variant_id,
                        'quantity' => $product['quantity'],
                        'unit_price_usd' => $product['price'],
                        'unit_price_khr' => $product['price'] * 4100,
                    ]);
                }
                $productData->quantity = $productData->quantity - $product['quantity'];
                $productData->save();
                SaleTransactionDetail::create([
                    'sale_transaction_id' => $saleTransaction->transaction_id,
                    'product_id' => $productData->product_id,
                    'quantity' => $product['quantity'],
                    'unit_price_usd' => $product['price'],
                    'unit_price_khr' => $product['price'] * 4100,
                ]);
                return $productData;
            });
            DB::commit();
            return response()->json([
                'message' => 'Sale products successfully',
                'data' => [
                    'invoice_number' => $saleTransaction->invoice_number,
                    'total_amount_usd' => Helpers::formatPriceToDollar($saleTransaction->total_amount_usd),
                    'total_amount_khr' => Helpers::formatPriceToKhr($saleTransaction->total_amount_khr),
                    'delivery_fee' => Helpers::formatPriceToDollar($saleTransaction->delivery_fee),
                    'transaction_date' => Helpers::formatDate($saleTransaction->transaction_date),
                    'products' => $product,
                    'customer' => $saleTransaction->customer,
                ]
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['message' => $th->getMessage()], 500);
        }


        return response()->json($product);
    }

    public function generateInvoiceNumber()
    {
        return 'INV-' . str_pad(SaleTransaction::count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
