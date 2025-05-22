<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use App\Http\Resources\PosResource;

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
            $query->whereHas('category', function ($query) {
                $query->where('category_id', request()->category);
            });
        })->latest()->paginate(10);

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
}
