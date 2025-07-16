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
            'payment_status' => $this->status,
            'sale_transaction_details' => $this->saleTransactionDetails->map(function ($detail) {
                $products = [];
                if ($detail->variant) {
                    // Handle case where variant is a single model or a collection
                    $variants = is_iterable($detail->variant) ? $detail->variant : [$detail->variant];
                    foreach ($variants as $variant) {
                        $products[] = [
                            'product_id' => null,
                            'type' => 'variant',
                            'variant_id' => $variant->variant_id,
                            'stock_remaining' => $variant->quantity,
                            'name' => $variant->variant_code,
                            'quantity' => $detail->quantity,
                            'unit_price' => $variant->sell_price_usd,
                            'size' => $variant->size,
                            'images' => $variant->images->first()?->path ? asset('storage/' . $variant->images->first()?->path) : "",

                            'color' => $variant->color,
                            'subtotal' => $variant->sell_price_usd * $detail->quantity,
                        ];
                    }
                } else {
                    $products[] = [
                        'product_id' => $detail->product->product_id,
                        'variant_id' => null,
                        'type' => 'single',
                        'stock_remaining' => $detail->product->quantity,
                        'name' => $detail->product->product_name,
                        'quantity' => $detail->quantity,
                        'unit_price' => $detail->product->sell_price_usd,
                        'size' => $detail->product->size,
                        'images' =>  $detail->product->images->first()?->path ? asset('storage/' . $detail->product->images->first()?->path) : "",
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
