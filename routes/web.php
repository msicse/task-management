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
use App\Http\Controllers\NotificationController;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('departments', DepartmentController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('projects', ProjectController::class);
    Route::get('my-tasks', [TaskController::class, 'myTasks'])->name('task.mytasks');
    // Task import routes
    Route::get('/tasks/import', [TaskController::class, 'showImportForm'])->name('tasks.import');
    Route::post('/tasks/import', [TaskController::class, 'import'])->name('tasks.import.process');

    // Task reports and exports
    Route::get('/tasks/reports', [TaskController::class, 'showReportsPage'])->name('tasks.reports');
    Route::get('/tasks/export/excel', [TaskController::class, 'exportExcel'])->name('tasks.export.excel');
    Route::get('/tasks/export/pdf', [TaskController::class, 'exportPdf'])->name('tasks.export.pdf');
    Route::get('/tasks/{task}/pdf', [TaskController::class, 'generateTaskPdf'])->name('tasks.pdf');

    Route::resource('tasks', TaskController::class);
    Route::put('/tasks/{task}/details', [TaskController::class, 'updateTaskDetails'])->name('tasks.update-details');
    Route::resource('users', UserController::class);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/all', [NotificationController::class, 'showAll'])->name('notifications.show-all');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // API routes for notifications
    Route::get('/api/notifications/all', [NotificationController::class, 'getAllNotifications']);
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
