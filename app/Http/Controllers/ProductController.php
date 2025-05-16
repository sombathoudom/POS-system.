<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $products = Product::with(['category', 'variants', 'images'])
            ->when($request->search, fn($query) => $query->where('product_name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate(10);

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
        // dd($request);
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
                    'product_code' => $validated['product_code'],
                    'cost_price_usd' => $validated['type'] === 'single' ? $validated['cost_price_usd'] : null,
                    'sell_price_usd' => $validated['type'] === 'single' ? $validated['sell_price_usd'] : null,
                    'cost_price_khr' => $validated['type'] === 'single' ? $validated['cost_price_khr'] : null,
                    'sell_price_khr' => $validated['type'] === 'single' ? $validated['sell_price_khr'] : null,
                    'size' => $validated['size'],
                    'color' => $validated['color'],
                ]);


                // Handle product images
                if (!empty($validated['image']['file'])) {
                    $path = $validated['image']['file']->store('products', 'public');

                    $product->images()->create([
                        'path' => $path,
                        'alt_text' => $validated['images']['alt_text'] ?? null,
                        'order' => 1,
                    ]);
                }

                // Handle variants for variant products
                if ($validated['type'] === 'variant' && !empty($validated['variants'])) {
                    foreach ($validated['variants'] as $variantData) {
                        $variant = $product->variants()->create([
                            'size' => $variantData['size'] ?? null,
                            'color' => $variantData['color'] ?? null,
                            'variant_code' => $variantData['variant_code'],
                            'cost_price_usd' => $variantData['cost_price_usd'],
                            'sell_price_usd' => $variantData['sell_price_usd'],
                            'cost_price_khr' => $variantData['cost_price_khr'],
                            'sell_price_khr' => $variantData['sell_price_khr'],
                        ]);

                        // Handle variant-specific images
                        if (!empty($variantData['images'])) {
                            $path = $variantData['images']['file']->store('variants', 'public');
                            $variant->images()->create([
                                'path' => $path,
                                'alt_text' => $variantData['images']['alt_text'] ?? null,
                                'order' => 1,
                            ]);
                        }
                    }
                }

                // Return the product with related data
                return to_route('products.index')->with('success', 'Product created successfully');
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
        $product = Product::with(['category', 'variants', 'images'])->findOrFail($id);
        return inertia('admin/product/form-products', [
            'product' => ProductResource::make($product),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, string $id)
    {
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($validated, $request, $id) {
                $product = Product::findOrFail($id);
                $product->update($validated);

                // Handle product images
                if (!empty($validated['images'])) {
                    foreach ($validated['images'] as $index => $imageData) {
                        if (isset($imageData['id'])) {
                            // Update existing image
                            $image = $product->images()->findOrFail($imageData['id']);
                            $image->update([
                                'alt_text' => $imageData['alt_text'] ?? null,
                                'order' => $index + 1,
                            ]);
                        } else if (isset($imageData['file'])) {
                            // Add new image
                            $path = $imageData['file']->store('products', 'public');
                            $product->images()->create([
                                'path' => $path,
                                'alt_text' => $imageData['alt_text'] ?? null,
                                'order' => $index + 1,
                            ]);
                        }
                    }
                }

                // Handle variants for variant products
                if ($validated['type'] === 'variant' && !empty($validated['variants'])) {
                    foreach ($validated['variants'] as $variantData) {
                        $variant = $product->variants()->findOrFail($variantData['id']);
                        $variant->update($variantData);
                    }
                }
            });

            return to_route('products.index')->with('success', 'Product updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function variants(string $id)
    {
        $product = Product::with(['variants', 'variants.images'])->findOrFail($id);
        return inertia('admin/product/variants', [
            'product' => ProductResource::make($product),
        ]);
    }
}
