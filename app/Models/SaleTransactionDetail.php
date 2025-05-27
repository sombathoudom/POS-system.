<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleTransactionDetail extends Model
{
    protected $fillable = ['sale_transaction_id', 'product_id', 'variant_id', 'quantity', 'unit_price_usd', 'unit_price_khr'];

    public function saleTransaction()
    {
        return $this->belongsTo(SaleTransaction::class, 'sale_transaction_id', 'transaction_id');
    }
}
