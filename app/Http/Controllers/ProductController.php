<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $products = Product::with(['category', 'variants', 'images' => fn($query) => $query->orderBy('order')->first()])
        ->when($request->search, fn($query) => $query->where('product_name', 'like', '%' . $request->search . '%'))
        ->latest()
        ->paginate();
       
        return inertia('admin/product/products', [
            'products' => ProductResource::collection($products),
        ]); 
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/product/form-products');
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(ProductRequest $request)
    {
        // Get validated data
        $validated = $request->validated();
       
        try {
            // Use a transaction to ensure data consistency
            DB::transaction(function () use ($validated, $request) {
                // Create the product
                $product = Product::create([
                    'product_name' => $validated['product_name'],
                    'category_id' => $validated['category_id'],
                    'type' => $validated['type'],
                    'barcode' => $validated['type'] === 'single' ? $validated['barcode'] : null,
                    'cost_price_usd' => $validated['type'] === 'single' ? $validated['cost_price_usd'] : null,
                    'sell_price_usd' => $validated['type'] === 'single' ? $validated['sell_price_usd'] : null,
                    'cost_price_khr' => $validated['type'] === 'single' ? $validated['cost_price_khr'] : null,
                    'sell_price_khr' => $validated['type'] === 'single' ? $validated['sell_price_khr'] : null,
                ]);

                // Handle product images
                if (!empty($validated['images'])) {
                    foreach ($validated['images'] as $index => $imageData) {
                        $path = $imageData['file']->store('products', 'public'); // Store in storage/app/public/products
                        $product->images()->create([
                            'path' => $path,
                            'alt_text' => $imageData['alt_text'] ?? null,
                            'order' => $index + 1,
                        ]);
                    }
                }

                // Handle variants for variant products
                if ($validated['type'] === 'variant' && !empty($validated['variants'])) {
                    foreach ($validated['variants'] as $variantData) {
                        $variant = $product->variants()->create([
                            'size' => $variantData['size'] ?? null,
                            'color' => $variantData['color'] ?? null,
                            'barcode' => $variantData['barcode'] ?? null,
                            'cost_price_usd' => $variantData['cost_price_usd'],
                            'sell_price_usd' => $variantData['sell_price_usd'],
                            'cost_price_khr' => $variantData['cost_price_khr'],
                            'sell_price_khr' => $variantData['sell_price_khr'],
                        ]);

                        // Handle variant-specific images
                        if (!empty($variantData['images'])) {
                            foreach ($variantData['images'] as $index => $imageData) {
                                $path = $imageData['file']->store('variants', 'public');
                                $variant->images()->create([
                                    'path' => $path,
                                    'alt_text' => $imageData['alt_text'] ?? null,
                                    'order' => $index + 1,
                                ]);
                            }
                        }
                    }
                }
               
                // Return the product with related data
                return response()->json(
                    $product->load(['variants', 'images', 'variants.images']),
                    201
                );
            });
        } catch (\Exception $e) {
            dd($e->getMessage());
            // Log the error (optional, requires logging setup)
            //Log::error('Product creation failed: ' . $e->getMessage());

            // Return error response
            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
