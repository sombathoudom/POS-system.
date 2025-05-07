<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::group(['middleware' => 'auth', 'prefix' => 'admin', 'name' => 'admin.'], function () {
    Route::get('users', function () {
        return Inertia::render('admin/users');
    })->name('users');
});
