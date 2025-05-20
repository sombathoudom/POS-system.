<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Support\Facades\Storage;
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
                        'alt_text' => $validated['image']['alt_text'] ?? null,
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
                        if (!empty($variantData['image']['file'])) {  // Changed from images to image
                            $path = $variantData['image']['file']->store('variants', 'public');
                            $variant->images()->create([
                                'path' => $path,
                                'alt_text' => $variantData['image']['alt_text'] ?? null,  // Changed from images to image
                                'order' => 1,
                            ]);
                        }
                    }
                }
                // Return the product with related data
            });
            return to_route('products.index')->with('success', 'Product created successfully');
        } catch (\Exception $e) {
            Log::error('Product creation failed: ' . $e->getMessage());
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
    public function updates(UpdateProductRequest $request, string $id)
    {
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($validated, $id) {
                $product = Product::findOrFail($id);
                $product->update($validated);

                $this->handleProductImage($product, $validated);
                $this->handleProductVariants($product, $validated);
            });

            return to_route('products.index')->with('success', 'Product updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function handleProductImage(Product $product, array $validated): void
    {
        if ($validated['type'] !== 'single' || empty($validated['image']['file'])) {
            return;
        }

        $this->deleteExistingImage($product->images()->first());

        $path = $validated['image']['file']->store('products', 'public');
        $product->images()->create([
            'path' => $path,
            'alt_text' => $validated['image']['alt_text'] ?? null,
            'order' => 1,
        ]);
    }

    private function handleProductVariants(Product $product, array $validated): void
    {
        if ($validated['type'] !== 'variant' || empty($validated['variants'])) {
            return;
        }
        foreach ($validated['variants'] as $variantData) {
            if (isset($variantData['id'])) {
                $variant = $product->variants()->findOrFail($variantData['id']);
                $variant->update($variantData);
            } else {
                $variant = $product->variants()->create($variantData);
            }
            $this->handleVariantImage($variant, $variantData);
        }
    }

    private function handleVariantImage($variant, array $variantData): void
    {
        if (empty($variantData['image'])) {
            return;
        }

        $this->deleteExistingImage($variant->images()->first());

        $path = $variantData['image']['file']->store('variants', 'public');
        $variant->images()->create([
            'path' => $path,
            'alt_text' => $variantData['image']['alt_text'] ?? null,
            'order' => 1,
        ]);
    }

    private function deleteExistingImage($existingImage): void
    {
        if (!$existingImage) {
            return;
        }

        Storage::disk('public')->delete($existingImage->path);
        $existingImage->delete();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //'
        $product = Product::findOrFail($id);
        $product->variants()->delete();
        $product->images()->delete();
        $product->delete();
        return to_route('products.index')->with('success', 'Product deleted successfully');
    }

    public function destroyVariant(string $id)
    {
        $variant = ProductVariant::findOrFail($id);
        $variant->images()->delete();
        $variant->delete();
        return to_route('products.index')->with('success', 'Variant deleted successfully');
    }

    public function variants(string $id)
    {
        $product = Product::with(['variants', 'variants.images'])->findOrFail($id);
        return inertia('admin/product/variants', [
            'product' => ProductResource::make($product),
        ]);
    }

    public function filterProduct(Request $request)
    {

        $products = Product::where('product_name', 'like', '%' . $request->search . '%')
            ->orWhere('product_code', 'like', '%' . $request->search . '%')
            ->orWhere('product_id', $request->search)
            ->with(['images', 'variants', 'variants.images'])
            ->limit(10)
            ->get();
        $products = ProductResource::collection($products);
        return $products;
    }
}
