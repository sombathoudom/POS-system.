<?php

namespace App\Http\Resources;

use App\Utils\Helpers;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class PurchaseOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'supplier' => $this->supplier->supplier_name,
            'order_date' => Helpers::formatDate($this->order_date),
            'status' => $this->status,
            'total_amount' => Helpers::formatPriceToDollar($this->total_amount),
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product' => Optional($item->product)->product_name,
                    'variant' => $item->variant ? Optional($item->variant)->size . ' ' . Optional($item->variant)->color : null,
                    'quantity' => $item->quantity,
                    'unit_price' => Helpers::formatPriceToDollar($item->unit_price),
                    'subtotal' => Helpers::formatPriceToDollar($item->subtotal),
                ];
            }),

        ];
    }
}
