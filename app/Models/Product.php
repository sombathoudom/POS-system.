<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'product_id';

    protected $fillable = [
        'product_name',
        'category_id',
        'type',
        'cost_price_usd',
        'sell_price_usd',
        'cost_price_khr',
        'sell_price_khr',
        'size',
        'color',
        'quantity',
        'product_code',
    ];


    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }

    public function images()
    {
        return $this->morphMany(ProductImage::class, 'imageable');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
    public function isSingle()
    {
        return $this->type === 'single';
    }

    public function isVariant()
    {
        return $this->type === 'variant';
    }
}
