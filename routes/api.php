<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramController;

Route::middleware('api')->post('/telegram/webhook', [TelegramController::class, 'webhook']);
