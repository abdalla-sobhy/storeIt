<?php

use App\Http\Controllers\FileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/signin',[UserController::class,'signin'])->name('signin');
Route::post('/verifyOtp', [UserController::class, 'verifyOtp'])->name('verifyOtp');
Route::post('/resendOtp', [UserController::class, 'resendOtp'])->name('resendOtp');
Route::post('/login', [UserController::class,'login'])->name('login');
Route::get('/userData', [UserController::class, 'userData'])->name('userData');
Route::post('/logout', [UserController::class, 'logout'])->name('logout');
Route::post('/addFile', [FileController::class,'addFile'])->name('addFile');
Route::get('/list', [FileController::class,'list'])->name('list');
Route::post('/changeName', [FileController::class,'changeName'])->name('changeName');
Route::post('/deleteFile', [FileController::class,'deleteFile'])->name('deleteFile');
Route::post('/shareFile', [FileController::class,'shareFile'])->name('shareFile');
Route::get('/search',[FileController::class,'search'])->name('search');

