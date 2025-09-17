<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'transaction_id' => $this->transaction_id,
            'invoice_number' => $this->invoice_number,
            'customer' => $this->customer,
            'payment_status' => $this->status,
            'discount' => $this->discount,
            'sale_transaction_details' => $this->getTransactionDetails(),
            'total_amount_khr' => $this->total_amount_khr,
            'total_amount_usd' => $this->total_amount_usd,
            'delivery_fee' => $this->delivery_fee,
            'transaction_date' => $this->transaction_date,
            'status' => $this->status,
        ];
    }

    /**
     * Get formatted transaction details.
     *
     * @return array
     */
    private function getTransactionDetails(): array
    {
        return $this->saleTransactionDetails
            ->map(fn($detail) => $this->mapTransactionDetail($detail))
            ->collapse()
            ->values()
            ->toArray();
    }

    /**
     * Map a single transaction detail to product array.
     *
     * @param mixed $detail
     * @return array
     */
    private function mapTransactionDetail($detail): array
    {
        return $detail->variant
            ? $this->mapVariantProducts($detail)
            : [$this->mapSingleProduct($detail)];
    }

    /**
     * Map variant products for a transaction detail.
     *
     * @param mixed $detail
     * @return array
     */
    private function mapVariantProducts($detail): array
    {
        $variants = is_iterable($detail->variant) ? $detail->variant : [$detail->variant];
        $productImage = $this->getProductImageUrl($detail->variant->product);

        return collect($variants)->map(function ($variant) use ($detail, $productImage) {
            return [
                'product_id' => null,
                'variant_id' => $variant->variant_id,
                'type' => 'variant',
                'stock_remaining' => $variant->quantity,
                'name' => $variant->variant_code,
                'quantity' => $detail->quantity,
                'unit_price' => $variant->sell_price_usd,
                'size' => $variant->size,
                'color' => $variant->color,
                'images' => $this->getVariantImageUrl($variant, $productImage),
                'calculation_type' => $detail->calculation_type,
                'calculation_value' => $detail->calculation_value,
                'return_date' => $detail->return_date,
                'subtotal' => $this->calculateSubtotal($variant->sell_price_usd, $detail->quantity),
            ];
        })->toArray();
    }

    /**
     * Map single product for a transaction detail.
     *
     * @param mixed $detail
     * @return array
     */
    private function mapSingleProduct($detail): array
    {
        return [
            'product_id' => $detail->product->product_id,
            'variant_id' => null,
            'type' => 'single',
            'stock_remaining' => $detail->product->quantity,
            'name' => $detail->product->product_name,
            'quantity' => $detail->quantity,
            'unit_price' => $detail->product->sell_price_usd,
            'size' => $detail->product->size,
            'color' => $detail->product->color,
            'images' => $this->getProductImageUrl($detail->product),
            'subtotal' => $this->calculateSubtotal($detail->product->sell_price_usd, $detail->quantity),
        ];
    }

    /**
     * Get product image URL.
     *
     * @param mixed $product
     * @return string
     */
    private function getProductImageUrl($product): string
    {
        $imagePath = $product->images->first()?->path;
        return $imagePath ? asset('storage/' . $imagePath) : '';
    }

    /**
     * Get variant image URL with fallback to product image.
     *
     * @param mixed $variant
     * @param string $productImageUrl
     * @return string
     */
    private function getVariantImageUrl($variant, string $productImageUrl): string
    {
        $variantImagePath = $variant->images->first()?->path;
        return $variantImagePath ? asset('storage/' . $variantImagePath) : $productImageUrl;
    }

    /**
     * Calculate subtotal for a product.
     *
     * @param float $unitPrice
     * @param int $quantity
     * @return float
     */
    private function calculateSubtotal(float $unitPrice, int $quantity): float
    {
        return $unitPrice * $quantity;
    }
}
