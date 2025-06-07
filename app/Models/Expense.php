<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = ['expense_date', 'name', 'amount', 'description', 'expense_category_id'];

    public function expenseCategory()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }
}
