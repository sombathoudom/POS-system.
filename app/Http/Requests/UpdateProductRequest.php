<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust based on your authorization logic
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'product_name' => 'required|string|max:255',
            'product_code' => [
                'required_if:type,single',
                'nullable',
                Rule::unique('products', 'product_code')->ignore($productId),
            ],
            'category_id' => 'required|exists:categories,category_id',
            'type' => 'required|in:single,variant',
            'size' => [
                'required_if:type,single',
                'nullable',
                'in:FreeSize,xs,s,m,l,xl,xxl,xxxl',
            ],
            'color' => [
                'required_if:type,single',
                'nullable',
                'string',
                'max:255',
            ],
            'cost_price_usd' => [
                'required_if:type,single',
                'nullable',
                'numeric',
                'min:0',
            ],
            'sell_price_usd' => [
                'required_if:type,single',
                'nullable',
                'numeric',
                'min:0',
            ],
            'cost_price_khr' => [
                'required_if:type,single',
                'nullable',
                'numeric',
                'min:0',
            ],
            'sell_price_khr' => [
                'required_if:type,single',
                'nullable',
                'numeric',
                'min:0',
            ],
            // Product image validation - only one image
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],
            'image_id' => 'nullable|exists:product_images,id',
            'image_alt_text' => 'nullable|string|max:255',

            // Variants validation
            'variants' => [
                'required_if:type,variant',
                'nullable',
                'array',
            ],
            'variants.*.variant_code' => [
                'required',
                Rule::unique('product_variants', 'variant_code')->ignore($this->input('variants.*.id')),
            ],
            'variants.*.size' => [
                'required',
                'in:FreeSize,xs,s,m,l,xl,xxl,xxxl',
            ],
            'variants.*.color' => [
                'required',
                'string',
                'max:255',
            ],
            'variants.*.cost_price_usd' => [
                'required',
                'numeric',
                'min:0',
            ],
            'variants.*.sell_price_usd' => [
                'required',
                'numeric',
                'min:0',
            ],
            'variants.*.cost_price_khr' => [
                'required',
                'numeric',
                'min:0',
            ],
            'variants.*.sell_price_khr' => [
                'required',
                'numeric',
                'min:0',
            ],
            // Variant image validation - optional single image per variant
            'variants.*.image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],
            'variants.*.image_id' => 'nullable|exists:product_variant_images,id',
            'variants.*.image_alt_text' => 'nullable|string|max:255',
        ];
    }
}
