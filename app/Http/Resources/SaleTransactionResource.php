<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'transaction_id' => $this->transaction_id,
            'invoice_number' => $this->invoice_number,
            'customer' => $this->customer,
            'sale_transaction_details' => $this->saleTransactionDetails->map(function ($detail) {
                $products = [];
                if ($detail->variant) {
                    // Handle case where variant is a single model or a collection
                    $variants = is_iterable($detail->variant) ? $detail->variant : [$detail->variant];
                    foreach ($variants as $variant) {
                        $products[] = [
                            'name' => $variant->variant_code,
                            'quantity' => $detail->quantity,
                            'unit_price' => $variant->sell_price_usd,
                            'size' => $variant->size,
                            'color' => $variant->color,
                            'subtotal' => $variant->sell_price_usd * $detail->quantity,
                        ];
                    }
                } else {
                    $products[] = [
                        'name' => $detail->product->product_name,
                        'quantity' => $detail->quantity,
                        'unit_price' => $detail->product->sell_price_usd,
                        'size' => $detail->product->size,
                        'color' => $detail->product->color,
                        'subtotal' => $detail->product->sell_price_usd * $detail->quantity,
                    ];
                }
                return $products;
            })->collapse()->values()->toArray(),
            'total_amount_khr' => $this->total_amount_khr,
            'total_amount_usd' => $this->total_amount_usd,
            'delivery_fee' => $this->delivery_fee,
            'transaction_date' => $this->transaction_date,
            'status' => $this->status,
        ];
    }
}
