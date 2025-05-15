<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,category_id',
            'type' => 'required|in:single,variant',
            'barcode' => 'required_if:type,single|nullable|string|unique:products,barcode',
            'cost_price_usd' => 'required_if:type,single|nullable|numeric|min:0',
            'sell_price_usd' => 'required_if:type,single|nullable|numeric|min:0',
            'cost_price_khr' => 'required_if:type,single|nullable|numeric|min:0',
            'sell_price_khr' => 'required_if:type,single|nullable|numeric|min:0',
            'images' => 'required|array|min:1', // At least one image
            'images.*.file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'images.*.alt_text' => 'nullable|string|max:255',
            'variants' => 'required_if:type,variant|array|min:1',
            'variants.*.size' => 'nullable|string',
            'variants.*.color' => 'nullable|string',
            'variants.*.barcode' => 'nullable|string|unique:product_variants,barcode',
            'variants.*.cost_price_usd' => 'required|numeric|min:0',
            'variants.*.sell_price_usd' => 'required|numeric|min:0',
            'variants.*.cost_price_khr' => 'required|numeric|min:0',
            'variants.*.sell_price_khr' => 'required|numeric|min:0',
            'variants.*.images' => 'nullable|array',
            'variants.*.images.*.file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants.*.images.*.alt_text' => 'nullable|string|max:255',
        ];
    }
}
