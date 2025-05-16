<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'variant_id';

    protected $fillable = [
        'product_id',
        'size',
        'color',
        'variant_code',
        'cost_price_usd',
        'sell_price_usd',
        'cost_price_khr',
        'sell_price_khr',

    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function images()
    {
        return $this->morphMany(ProductImage::class, 'imageable');
    }
}
