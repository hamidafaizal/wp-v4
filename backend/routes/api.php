<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\ProductLinkController;
use App\Http\Controllers\PwaController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Device management
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::post('/devices/generate-token', [DeviceController::class, 'generateToken']);
    Route::post('/devices', [DeviceController::class, 'register']);
    Route::delete('/devices/{device}', [DeviceController::class, 'destroy']);

    // Batch management
    Route::get('/batches', [BatchController::class, 'index']);
    Route::post('/batches', [BatchController::class, 'store']);
    Route::put('/batches/{batch}', [BatchController::class, 'update']);
    Route::post('/batches/{batch}/send', [BatchController::class, 'sendToPwa']);
    Route::delete('/batches/{batch}', [BatchController::class, 'destroy']);

    // Product links
    Route::get('/links', [ProductLinkController::class, 'index']);
    Route::post('/links', [ProductLinkController::class, 'store']);
    Route::post('/links/upload', [ProductLinkController::class, 'bulkUpload']);
    Route::delete('/links/{link}', [ProductLinkController::class, 'destroy']);
});

// PWA routes (no auth required, uses device token)
Route::prefix('pwa')->group(function () {
    Route::post('/batches', [PwaController::class, 'getBatches']);
    Route::post('/links/update-status', [PwaController::class, 'updateLinkStatus']);
    Route::post('/batches/complete', [PwaController::class, 'completeBatch']);
});