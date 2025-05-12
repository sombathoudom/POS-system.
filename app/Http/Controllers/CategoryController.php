<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\CategoryRequest;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('category/category', [
            'categories' => Category::paginate(10),
        ]);
    }

    public function store(CategoryRequest $request)
    {
        Category::create($request->validated());
        return redirect()->route('category.index')->with('success', 'Category created successfully');
    }

    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());
        return to_route('category.index')->with('success', 'Category updated successfully');
    }

    public function destroy(Category $category, $id)
    {
        $category = Category::find($id);
        $category->delete();
        return to_route('category.index')->with('success', 'Category deleted successfully');
    }
}
