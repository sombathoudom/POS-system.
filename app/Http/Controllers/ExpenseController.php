<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use App\Http\Requests\ExpenseRequest;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = Expense::with('expenseCategory')
            ->latest('expense_date')
            ->when($request->filled('expense_category_id'), function ($query) use ($request) {
                $query->when($request->expense_category_id === 'all',
                    fn($q) => $q->whereNotNull('expense_category_id'),
                    fn($q) => $q->where('expense_category_id', $request->expense_category_id)
                );
            })
            ->when($request->filled('start_date'), fn($query) =>
                $query->whereDate('expense_date', '>=', $request->start_date)
            )
            ->when($request->filled('end_date'), fn($query) =>
                $query->whereDate('expense_date', '<=', $request->end_date)
            )
            ->paginate(10)->withQueryString();
        return inertia('admin/expense/index', [
            'expenses' => $expenses,
            'expenseCategories' => ExpenseCategory::all(),
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
