<?php

namespace App\Http\Resources;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $products = [];
        $productImage = asset('storage/' . $this->images->first()?->path) ?? null;

        // // Add the main product if it has quantity
        // if (($this->quantity + $this->effective_quantity) > 0) {
        //     $products[] = [
        //         'key' => Str::uuid(),
        //         'id' => $this->product_id,
        //         'name' => $this->product_name,
        //         'code' => $this->product_code,
        //         'price' => $this->sell_price_usd,
        //         'category_id' => $this->category_id,
        //         'image' => $productImage,
        //         'type' => 'single',
        //         'size' => $this->size,
        //         'color' => $this->color,
        //         'current_stock' => $this->quantity + $this->effective_quantity,
        //     ];
        // }

        // // Add variants as separate products
        // foreach ($this->variants as $variant) {
        //     if (($variant->quantity + $variant->effective_quantity) > 0) {
        //         $products[] = [
        //             'key' => Str::uuid(),
        //             'id' => $this->product_id,
        //             'variant_id' => $variant->variant_id,
        //             'name' => $this->product_name . ' [' . $variant->variant_code . ']',
        //             'code' => $variant->variant_code,
        //             'price' => $variant->sell_price_usd,
        //             'image' => $variant->images->first()?->path ? asset('storage/' . $variant->images->first()?->path) : $productImage,
        //             'type' => 'variant',
        //             'current_stock' => $variant->quantity + $variant->effective_quantity,
        //             'size' => $variant->size,
        //             'color' => $variant->color,
        //             'variant_name' => $this->product_name,
        //         ];
        //     }
        // }

        // return $products;
        return [
            'key' => Str::uuid(),
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'name' => $this->product_name . ' [' . $this->variant_code . ']',
            'code' => $this->variant_code,
            'price' => $this->sell_price_usd,
            'image' => $this->images->first()?->path ? asset('storage/' . $this->images->first()?->path) : $productImage,
            'type' => 'variant',
            'current_stock' => $this->effective_quantity,
            'size' => $this->size,
            'color' => $this->color,
            'variant_name' => $this->product_name,
        ];
    }
}
