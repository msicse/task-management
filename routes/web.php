<?php

use App\Http\Controllers\DashboardController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\TaskFileController;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('departments', DepartmentController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('projects', ProjectController::class);
    Route::get('tasks/my-tasks', [TaskController::class, 'myTasks'])->name('tasks.mytasks');
    Route::resource('tasks', TaskController::class);
    Route::resource('users', UserController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/tasks/{task}/files', [TaskFileController::class, 'store'])->name('task-files.store');
    Route::delete('/task-files/{file}', [TaskFileController::class, 'destroy'])->name('task-files.destroy');
    Route::get('/task-files/{file}/download', [TaskFileController::class, 'download'])->name('task-files.download');
});

require __DIR__ . '/auth.php';
