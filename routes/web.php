<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Route::get('category', function () {
    //     return Inertia::render('category/category');
    // })->name('category.index');

    Route::get('category', [CategoryController::class, 'index'])->name('category.index');
    Route::post('category', [CategoryController::class, 'store'])->name('category.store');
    Route::put('category/{category}', [CategoryController::class, 'update'])->name('category.update');
    Route::delete('category/{id}/delete', [CategoryController::class, 'destroy'])->name('category.destroy');
    Route::resource('suppliers', SupplierController::class);

    Route::resource('products', ProductController::class);
    Route::post('products/{id}/update', [ProductController::class, 'updates'])->name('products.updates');
    Route::delete('products/{id}/variant', [ProductController::class, 'destroyVariant'])->name('products.destroyVariant');
    Route::get('products/variants/{id}', [ProductController::class, 'variants'])->name('products.variants');
    Route::get('product/search', [ProductController::class, 'filterProduct'])->name('products.search');
    Route::get('purchase-order', [PurchaseController::class, 'index'])->name('purchase.order');
    Route::get('purchase-order/create', [PurchaseController::class, 'create'])->name('purchase.create');
    Route::post('purchase-order', [PurchaseController::class, 'store'])->name('purchase.store');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
