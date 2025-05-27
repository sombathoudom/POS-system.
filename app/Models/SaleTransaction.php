<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleTransaction extends Model
{
    //
    protected $primaryKey = 'transaction_id';
    protected $fillable = ['customer_id', 'user_id', 'currency', 'total_amount_usd', 'total_amount_khr', 'delivery_fee', 'transaction_date', 'invoice_number'];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function saleTransactionDetails()
    {
        return $this->hasMany(SaleTransactionDetail::class, 'sale_transaction_id', 'transaction_id');
    }
}
