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
            'product_code' => [
                'required_if:type,single',
                'nullable',
                'unique:products,product_code',
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
            //'barcode' => 'required_if:type,single|nullable|string|unique:products,barcode',
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
            // 'cost_price_khr' => [
            //     'required_if:type,single',
            //     'nullable',
            //     'numeric',
            //     'min:0',
            // ],
            // 'sell_price_khr' => [
            //     'required_if:type,single',
            //     'nullable',
            //     'numeric',
            //     'min:0',
            // ],
            'image' => 'required',
            'image.file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image.alt_text' => 'nullable|string|max:255',
            'variants' => [
                'required_if:type,variant',
                'nullable',
                'array',
                'min:1',
            ],
            'variants.*.variant_code' => 'required|unique:product_variants,variant_code',
            'variants.*.size' => [
                'nullable',
                'in:FreeSize,xs,s,m,l,xl,xxl,xxxl',
            ],
            'variants.*.color' => [
                'nullable',
                'string',
                'max:255',
            ],
            'variants.*.cost_price_usd' => 'required|numeric|min:0',
            'variants.*.sell_price_usd' => 'required|numeric|min:0',
            // 'variants.*.cost_price_khr' => 'required|numeric|min:0',
            // 'variants.*.sell_price_khr' => 'required|numeric|min:0',
            'variants.*.image' => 'nullable|array',
            'variants.*.image.file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants.*.image.alt_text' => 'nullable|string|max:255',
        ];
    }
}
