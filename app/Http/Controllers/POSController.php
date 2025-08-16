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
use Illuminate\Support\Str;

class POSController extends Controller
{
    public function index()
    {

        $testFilter = Product::with(['variants', 'images', 'variants.images'])
            ->where(function ($query) {
                $query->where('deleted_at', null)
                    ->orWhereHas('variants', function ($q) {
                        $q->where('deleted_at', null);
                    });
            })
            ->when(request()->search, function ($query) {
                $query->where(function ($q) {
                    $search = '%' . request()->search . '%';
                    $q->where('product_name', 'like', $search)
                        ->orWhere('product_code', 'like', $search)
                        ->orWhereHas('variants', function ($sq) use ($search) {
                            $sq->where('variant_code', 'like', $search);
                        });
                });
            })
            ->when(request()->category, function ($query) {
                $query->where('category_id', request()->category);
            });

        $totalRows = $testFilter->count();
        $productData = $testFilter->offset((request()->input('page', 1) - 1) * 10);
        $productData = $productData->limit(10)->get();

        $array = [];

        foreach ($productData as $product) {
            $item = [
                'id'       => $product->product_id,
                'type'     => $product->type,
                'key' => Str::uuid(),
                'name'     => $product->product_name,
                'size' => $product->size,
                'color' => $product->color,
                'code'     => $product->product_code,
                'price'    => $product->sell_price_usd,
                'image' => $product->images->first()?->path ? asset('storage/' . $product->images->first()?->path) : null,
                'current_stock' => (int) $product->quantity
                    + (int) SaleTransactionDetail::where('product_id', $product->product_id)
                        ->whereNull('variant_id')
                        ->sum(DB::raw('CAST(calculation_value AS SIGNED)')),
                'variants' => [],
            ];

            if ($product->type === 'variant') {
                foreach ($product->variants as $variant) {
                    $qty = (int) $variant->quantity
                        + (int) SaleTransactionDetail::where('variant_id', $variant->variant_id)
                            ->sum(DB::raw('CAST(calculation_value AS SIGNED)'));
                    if ($qty > 0) {
                        $item['variants'][] = [
                            'id'       => $variant->variant_id,
                            'type'     => $product->type,
                            'variant_id' => $variant->variant_id,
                            'size' => $variant->size,
                            'color' => $variant->color,
                            'key' => Str::uuid(),
                            'image' => $variant->images->first()?->path ? asset('storage/' . $variant->images->first()?->path) : null,
                            'name'     => $variant->variant_code,
                            'code'     => $variant->variant_code,
                            'price'    => $variant->sell_price_usd,
                            'current_stock' => $qty,
                        ];
                    }
                }
            }

            // if you only want to include products that have any stock:
            if ($item['current_stock'] > 0 || count($item['variants']) > 0) {
                $array[] = $item;
            }
        }

        return Inertia::render('admin/pos/pos', [
            'productss' => $array,
            'totalRows' => $totalRows,
        ]);
        // $products = Product::with(['category', 'variants', 'images', 'variants.images'])
        //     ->select('products.*')
        //     ->addSelect([
        //         'effective_quantity' => SaleTransactionDetail::selectRaw('COALESCE(SUM(calculation_value), 0)')
        //             ->whereColumn('product_id', 'products.product_id')
        //             ->whereNull('variant_id')
        //     ])
        //     ->where(function ($query) {
        //         $query->where('deleted_at', null)
        //             ->orWhereHas('variants', function ($query) {
        //                 $query->where('deleted_at', null);
        //             });
        //     })
        //     ->when(request()->search, function ($query) {
        //         $query->where('product_name', 'like', '%' . request()->search . '%')
        //             ->orWhere('product_code', 'like', '%' . request()->search . '%')
        //             ->orWhereHas('variants', function ($query) {
        //                 $query->where('variant_code', 'like', '%' . request()->search . '%');
        //             });
        //     })->when(request()->category, function ($query) {
        //         $query->where('category_id', request()->category);
        //     })->latest()->paginate(10)->withQueryString();

        // // Load effective quantity for variants
        // $products->getCollection()->each(function ($product) {
        //     $product->variants->each(function ($variant) {
        //         $effectiveQuantity = SaleTransactionDetail::where('variant_id', $variant->variant_id)
        //             ->sum('calculation_value');
        //         $variant->effective_quantity = $effectiveQuantity;
        //     });
        // });

        // // Transform and flatten the products
        // $flattenedProducts = $products->getCollection()->flatMap(function ($product) {
        //     return (new PosResource($product))->toArray(request());
        // });

        // // Create a new collection with the flattened products
        // $products->setCollection($flattenedProducts);

        // return Inertia::render('admin/pos/pos', [
        //     'productss' => $products
        // ]);
    }

    public function saleProducts(Request $request)
    {
        try {
            // Start transaction using closure for auto commit/rollback
            return DB::transaction(function () use ($request) {
                $data = $request->all();

                // Validate stock for all products before processing
                foreach ($data['products'] as $product) {
                    $isVariant = isset($product['variant_id']) && $product['variant_id'] !== null;

                    // Get the model and current stock
                    $model = $isVariant
                        ? ProductVariant::find($product['variant_id'])
                        : Product::find($product['id']);

                    if (!$model) {
                        throw new \Exception('Product or variant not found.');
                    }

                    // Calculate effective stock
                    $originalStock = $model->quantity;
                    $totalSold = SaleTransactionDetail::where($isVariant ? 'variant_id' : 'product_id', $isVariant ? $model->variant_id : $model->product_id)
                        ->sum('calculation_value');

                    $effectiveStock = $originalStock + $totalSold;

                    // Check if enough stock available
                    if ($effectiveStock < $product['quantity']) {
                        $productName = $isVariant ? $model->variant_code : $model->product_name;
                        throw new \Exception("Insufficient stock for {$productName}. Available: {$effectiveStock}, Requested: {$product['quantity']}");
                    }
                }

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
                    'note' => "POS Sale"
                ]);

                foreach ($data['products'] as $product) {
                    $isVariant = isset($product['variant_id']) && $product['variant_id'] !== null;

                    // Model already validated in the check above
                    $model = $isVariant
                        ? ProductVariant::find($product['variant_id'])
                        : Product::find($product['id']);

                    // Create sale transaction detail with calculation_value = -quantity
                    SaleTransactionDetail::create([
                        'sale_transaction_id' => $saleTransaction->transaction_id,
                        'product_id'          => $isVariant ? null : $model->product_id,
                        'variant_id'          => $isVariant ? $model->variant_id : null,
                        'quantity'            => $product['quantity'],               // positive count
                        'calculation_value'   => -1 * $product['quantity'],          // negative adjustment
                        'calculation_type'    => 'decrease',
                        'unit_price_usd'      => $product['price'],
                        'unit_price_khr'      => $product['price'] * 4100,
                    ]);
                }

                // Return response as before
                return response()->json([
                    'message' => 'Sale recorded successfully',
                    'data'    => [
                        'invoice_number'    => $saleTransaction->invoice_number,
                        'total_amount_usd'  => $saleTransaction->total_amount_usd,
                        'total_amount_khr'  => $saleTransaction->total_amount_khr,
                        'delivery_fee'      => $saleTransaction->delivery_fee,
                        'transaction_date'  => Helpers::formatDate($saleTransaction->transaction_date),
                        'products'          => $data['products'],
                        'customer'          => $saleTransaction->customer,
                        'status'            => $saleTransaction->status,
                    ],
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
