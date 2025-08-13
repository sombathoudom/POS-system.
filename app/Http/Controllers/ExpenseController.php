<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use App\Http\Requests\ExpenseRequest;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with('expenseCategory')->latest('expense_date')->paginate(10);
        return inertia('admin/expense/index', [
            'expenses' => $expenses,
        ]);
    }

    public function create()
    {
        return inertia('admin/expense/form-expense', [
            'expenseCategories' => ExpenseCategory::all(),
        ]);
    }

    public function store(ExpenseRequest $request)
    {
        Expense::create($request->validated());
        return to_route('expsense.index')->with('success', 'Expense created successfully');
    }

    public function update(ExpenseRequest $request, $id)
    {
        $expense = Expense::find($id);
        $expense->update($request->validated());
        return to_route('expsense.index')->with('success', 'Expense updated successfully');
    }

    public function edit($id)
    {
        $expense = Expense::find($id);
        return inertia('admin/expense/form-expense', [
            'expense' => $expense,
            'expenseCategories' => ExpenseCategory::all(),
        ]);
    }
}
