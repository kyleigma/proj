<?php

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('events')->group(function () {
        Route::get('/', [EventController::class, 'apiIndex'])->name('api.events.index');
        Route::post('/', [EventController::class, 'store'])->name('api.events.store');
        Route::put('/{event}', [EventController::class, 'update'])->name('api.events.update');
        Route::delete('/{event}', [EventController::class, 'destroy'])->name('api.events.destroy');
    });
});
