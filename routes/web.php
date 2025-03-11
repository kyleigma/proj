<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('welcome');  // Changed from 'Welcome' to 'welcome'
})->name('home');

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('register', function () {
        return Inertia::render('auth/register');
    })->name('register');
    
    Route::post('register', [RegisteredUserController::class, 'store']);
    
    Route::get('login', function () {
        return Inertia::render('auth/login');
    })->name('login');
});

// Protected routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Events routes
    Route::get('/events-table', function () {
        return Inertia::render('events-table');
    })->name('events.index');
    
    // Events API routes
    Route::prefix('api')->group(function () {
        Route::get('/events', [EventController::class, 'apiIndex'])->name('api.events.index');
        Route::post('/events', [EventController::class, 'store'])->name('api.events.store');
        Route::put('/events/{event}', [EventController::class, 'update'])->name('api.events.update');
        Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('api.events.destroy');
    });
});

// Include remaining auth routes
require __DIR__.'/auth.php';
