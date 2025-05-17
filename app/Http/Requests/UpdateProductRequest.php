<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('id');
        return [
            'product_name' => 'required|string|max:255',
            'product_code' => [
                'required_if:type,single',
                'nullable',
                Rule::unique('products', 'product_code')->ignore($this->id, 'product_id')
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
            'image' => 'nullable',
            'image.file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image.alt_text' => 'nullable|string|max:255',

            // 'image' => [
            //     'nullable',
            //     'image',
            //     'mimes:jpeg,png,jpg,gif',
            //     'max:2048',
            // ],
            // 'image_id' => 'nullable|exists:product_images,id',
            // 'image_alt_text' => 'nullable|string|max:255',

            // Variants validation
            'variants' => [
                'required_if:type,variant',
                'nullable',
                'array',
                'min:1',
            ],
            'variants.*.id' => 'nullable|exists:product_variants,variant_id', // Changed from required to nullable
            'variants.*.variant_code' => [
                'required',
                'string',
                'max:50',
                function($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];
                    $variantId = $this->input("variants.{$index}.id");

                    $query = \DB::table('product_variants')
                        ->where('variant_code', $value)
                        ->where('product_id', $this->route('id'));

                    // Only add the ID check if we're updating an existing variant
                    if ($variantId !== null) {
                        $query->where('variant_id', '!=', $variantId);
                    }

                    if ($query->exists()) {
                        $fail('The variant code has already been taken for this product.');
                    }
                }
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
            // 'image' => 'nullable',
            // 'image.file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // 'image.alt_text' => 'nullable|string|max:255',

            'variants.*.image' => [
                'nullable',
            ],
            'variants.*.file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048|exists:product_variant_images,id',
            'variants.*.image_alt_text' => 'nullable|string|max:255',
        ];
    }
}
