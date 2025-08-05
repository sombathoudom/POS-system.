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
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

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
                $data = $request->all();

                // Step 1: Validate input
                Validator::make($data, [
                    'customer_id' => 'required|exists:customers,id',
                    'status' => 'required|string',
                    'total' => 'required|numeric|min:0',
                    'total_khr' => 'required|numeric|min:0',
                    'deliveryFee' => 'nullable|numeric|min:0',
                    'discount' => 'nullable|numeric|min:0',
                    'products' => 'required|array|min:1',
                    'products.*.quantity' => 'required|integer|min:1',
                    'products.*.price' => 'required|numeric|min:0',
                    'products.*.id' => 'nullable|required_without:products.*.variant_id|integer',
                    'products.*.variant_id' => 'nullable|required_without:products.*.id|integer',

                ])->validate();

                // Step 2: Create sale transaction
                $saleTransaction = SaleTransaction::create([
                    'customer_id' => $data['customer_id'],
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'user_id' =>  1,
                    'status' => $data['status'],
                    'currency' => 'USD',
                    'total_amount_usd' => $data['total'],
                    'total_amount_khr' => $data['total_khr'],
                    'delivery_fee' => $data['deliveryFee'] ?? 0,
                    'total_discount' => $data['discount'] ?? 0,
                    'transaction_date' => now('Asia/Phnom_Penh')->format('Y-m-d H:i:s'),
                ]);

                // Step 3: Group and aggregate products by ID
                $cartItems = collect($data['products'])
                    ->groupBy(function ($item) {
                        return array_key_exists('variant_id', $item) && !is_null($item['variant_id'])
                            ? 'v_' . $item['variant_id']
                            : 'p_' . $item['id'];
                    })
                    ->map(function ($items) {
                        $first = $items->first();
                        $first['quantity'] = $items->sum('quantity');
                        return $first;
                    })
                    ->values(); // clean indexed array

                // Step 4: Deduct stock and create transaction details
                foreach ($cartItems as $product) {
                    $isVariant = array_key_exists('variant_id', $product) && !is_null($product['variant_id']);
                    $productData = $isVariant
                        ? ProductVariant::where('variant_id', $product['variant_id'])->lockForUpdate()->first()
                        : Product::where('product_id', $product['id'])->lockForUpdate()->first();

                    if (!$productData) {
                        throw new \Exception('Product or variant not found.');
                    }

                    if ((int) $productData->quantity < (int) $product['quantity']) {
                        throw new \Exception('Not enough stock for product: ' . ($isVariant ? 'Variant ID ' . $product['variant_id'] : 'Product ID ' . $product['id']));
                    }

                    // Deduct stock safely
                    $productData->decrement('quantity', $product['quantity']);

                    // Log stock deduction
                    Log::info('Stock deducted', [
                        'product' => $product,
                        'remaining' => $productData->quantity,
                    ]);

                    // Create sale transaction detail
                    SaleTransactionDetail::create([
                        'sale_transaction_id' => $saleTransaction->transaction_id,
                        'product_id' => $isVariant ? null : $productData->product_id,
                        'variant_id' => $isVariant ? $product['variant_id'] : null,
                        'quantity' => $product['quantity'],
                        'unit_price_usd' => $product['price'],
                        'unit_price_khr' => $product['price'] * 4100, // Optional: use dynamic rate
                    ]);
                }

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
