<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Utils\Helpers;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
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
                    $query->Where('variant_code', 'like', '%' . request()->search . '%');
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
            'productss' => $products
        ]);
    }

    public function saleProducts(Request $request)
    {
        try {
            // Start transaction using closure for auto commit/rollback
            return DB::transaction(function () use ($request) {
                $products = $request->all();

                // 1. Create the sale transaction
                $saleTransaction = SaleTransaction::create([
                    'customer_id' => $products['customer_id'],
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'user_id' => 1,
                    'status' => $products['status'],
                    'currency' => 'USD',
                    'total_amount_usd' => $products['total'],
                    'total_amount_khr' => $products['total_khr'],
                    'delivery_fee' => $products['deliveryFee'],
                    'total_discount' => $products['discount'],
                    'transaction_date' => now('Asia/Phnom_Penh')->format('Y-m-d H:i:s'),
                ]);

                // 2. Aggregate by product/variant to prevent double deduction
                $cartItems = collect($products['products'])
                    ->groupBy(function ($item) {
                        // Unique key by product or variant
                        return isset($item['variant_id'])
                            ? 'v_' . $item['variant_id']
                            : 'p_' . $item['id'];
                    })
                    ->map(function ($items) {
                        // Sum quantities for duplicate items
                        $first = $items->first();
                        $totalQty = $items->sum('quantity');
                        $first['quantity'] = $totalQty;
                        return $first;
                    });

                // 3. Deduct stock and create transaction details
                $cartItems->each(function ($product) use ($saleTransaction) {
                    if (!isset($product['variant_id'])) {
                        $productData = Product::where('product_id', $product['id'])
                            ->lockForUpdate()
                            ->first();
                    } else {
                        $productData = ProductVariant::where('variant_id', $product['variant_id'])
                            ->lockForUpdate()
                            ->first();
                    }
                    if (!$productData) {
                        throw new \Exception('Product not found');
                    }
                    if ($productData->quantity < $product['quantity']) {
                        throw new \Exception('Product quantity is not enough');
                    }

                    // Deduct stock
                    $productData->quantity -= $product['quantity'];
                    $productData->save();

                    // Record sale transaction detail
                    SaleTransactionDetail::create([
                        'sale_transaction_id' => $saleTransaction->transaction_id,
                        'product_id' => isset($product['variant_id']) ? null : $productData->product_id,
                        'variant_id' => isset($product['variant_id']) ? $product['variant_id'] : null,
                        'quantity' => $product['quantity'],
                        'unit_price_usd' => $product['price'],
                        'unit_price_khr' => $product['price'] * 4100,
                    ]);
                });

                // 4. Return your desired response
                return response()->json([
                    'message' => 'Sale products successfully',
                    'data' => [
                        'invoice_number' => $saleTransaction->invoice_number,
                        'total_amount_usd' => $saleTransaction->total_amount_usd,
                        'total_amount_khr' => $saleTransaction->total_amount_khr,
                        'delivery_fee' => $saleTransaction->delivery_fee,
                        'transaction_date' => Helpers::formatDate($saleTransaction->transaction_date),
                        'products' => $cartItems->values(),
                        'customer' => $saleTransaction->customer,
                        'status' => $saleTransaction->status,
                    ]
                ], 200);
            }); // DB::transaction closure will auto-commit or rollback
        } catch (\Throwable $th) {
            // Any error gets here, rollback already done
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function generateInvoiceNumber()
    {
        return 'INV-' . str_pad(SaleTransaction::count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
