<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('category/category', [
            'categories' => Category::paginate(10),
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255',
        ]);
        Category::create($request->all());
        return redirect()->route('category.index');
    }
}
