<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

Route::middleware('auth:api')->get('/user', function(Request $request){
    return $request->user();
});

// Route::post(uri: 'register', [UserController::class, 'register']);
