<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleTransactionDetail extends Model
{
    protected $fillable = ['sale_transaction_id', 'product_id', 'variant_id', 'quantity', 'unit_price_usd', 'unit_price_khr', 'calculation_type', 'calculation_value', 'sale_date', 'return_date'];

    public function saleTransaction()
    {
        return $this->belongsTo(SaleTransaction::class, 'sale_transaction_id', 'transaction_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
}
