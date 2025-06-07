<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SaleTransactionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Route::get('category', function () {
    //     return Inertia::render('category/category');
    // })->name('category.index');

    Route::get('category', [CategoryController::class, 'index'])->name('category.index');
    Route::post('category', [CategoryController::class, 'store'])->name('category.store');
    Route::put('category/{category}', [CategoryController::class, 'update'])->name('category.update');
    Route::delete('category/{id}/delete', [CategoryController::class, 'destroy'])->name('category.destroy');
    Route::resource('suppliers', SupplierController::class);
    Route::get('sale-transaction', [SaleTransactionController::class, 'index'])->name('sale-transaction.index');
    Route::resource('products', ProductController::class);
    Route::post('products/{id}/update', [ProductController::class, 'updates'])->name('products.updates');
    Route::delete('products/{id}/variant', [ProductController::class, 'destroyVariant'])->name('products.destroyVariant');
    Route::get('products/variants/{id}', [ProductController::class, 'variants'])->name('products.variants');
    Route::get('product/search', [ProductController::class, 'filterProduct'])->name('products.search');
    Route::get('purchase-order', [PurchaseController::class, 'index'])->name('purchase.index');
    Route::get('purchase-order/create', [PurchaseController::class, 'create'])->name('purchase.create');
    Route::post('purchase-order', [PurchaseController::class, 'store'])->name('purchase.store');
    Route::get('purchase-order/{id}/show', [PurchaseController::class, 'show'])->name('purchase.show');

    Route::get('expsense', [ExpenseController::class, 'index'])->name('expsense.index');
    Route::get('expsense/create', [ExpenseController::class, 'create'])->name('expsense.create');
    Route::post('expsense', [ExpenseController::class, 'store'])->name('expsense.store');
    Route::get('expsense/{id}/edit', [ExpenseController::class, 'edit'])->name('expsense.edit');
    Route::put('expsense/{id}', [ExpenseController::class, 'update'])->name('expsense.update');
    Route::delete('expsense/{id}', [ExpenseController::class, 'destroy'])->name('expsense.destroy');

    Route::get('pos', [POSController::class, 'index'])->name('pos.index');
    Route::post('pos/sale', [POSController::class, 'saleProducts'])->name('pos.saleProducts');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{id}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
