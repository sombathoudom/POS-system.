<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductImage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'imageable_id',
        'imageable_type',
        'path',
        'alt_text',
        'order',
    ];

    public function imageable()
    {
        return $this->morphTo();
    }
}
