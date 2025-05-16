<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_code' => $this->product_code,
            'category' => $this->category ? [
                'id' => $this->category->category_id,
                'name' => $this->category->category_name,
            ] : null,
            'type' => $this->type,
            'cost_price_usd' => $this->cost_price_usd,
            'sell_price_usd' => $this->sell_price_usd,
            'cost_price_khr' => $this->cost_price_khr,
            'sell_price_khr' => $this->sell_price_khr,
            'variant_count' => $this->variants->count(),
            'size' => $this->size,
            'color' => $this->color,
            'variants' => $this->when($this->variants, function () {
                return $this->variants->map(function ($variant) {
                    return [
                        'id' => $variant->variant_id,
                        'size' => $variant->size,
                        'color' => $variant->color,
                        'variant_code' => $variant->variant_code,
                        'cost_price_usd' => $variant->cost_price_usd,
                        'sell_price_usd' => $variant->sell_price_usd,
                        'cost_price_khr' => $variant->cost_price_khr,
                        'sell_price_khr' => $variant->sell_price_khr,
                        'images' => $variant->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'path' => asset('storage/' . $image->path),
                                'alt_text' => $image->alt_text,
                                'order' => $image->order,
                            ];
                        }),
                    ];
                });
            }),
            'images' => $this->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'path' => asset('storage/' . $image->path),
                    'alt_text' => $image->alt_text,
                    'order' => $image->order,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
