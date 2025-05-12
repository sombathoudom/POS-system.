<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'supplier_id';
    protected $fillable = ['supplier_name', 'contact_info'];
}
