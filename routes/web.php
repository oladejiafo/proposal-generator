<?php

use Illuminate\Support\Facades\Route;

// use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/{any}', function () {
//     return view('app');  // loads resources/views/app.blade.php
// })->where('any', '.*');
