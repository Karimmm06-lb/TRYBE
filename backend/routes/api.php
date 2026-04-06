<?php

use App\Http\Controllers\AppelOffreController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Routes Appels d'offres
Route::post('/appels-offres', [AppelOffreController::class, 'store']);
Route::get('/appels-offres', [AppelOffreController::class, 'index']);
Route::get('/appels-offres/{id}', [AppelOffreController::class, 'show']);

// Routes Notifications
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/{id}', [NotificationController::class, 'show']);