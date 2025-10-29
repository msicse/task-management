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
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityFileController;
use App\Http\Controllers\ActivityMonitorController;
use App\Http\Controllers\RoleCategoryController;
use App\Http\Controllers\WorkRoleController;
use App\Http\Controllers\ActivityCategoryController;
use App\Http\Controllers\ActivityReportController;

Route::redirect('/', '/dashboard');

// Public UI Test Route (no authentication required)
Route::get('/ui-test', function () {
    return Inertia::render('UITest/Index');
})->name('ui-test');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('departments', DepartmentController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('activity-categories', ActivityCategoryController::class);

    // Activity Categories API Routes
    Route::post('/api/activity-categories/preview-code', [ActivityCategoryController::class, 'previewCode'])->name('activity-categories.preview-code');
    Route::get('/api/test-code-gen', function() {
        try {
            $category = new \App\Models\ActivityCategory();
            $category->name = 'Test Inspection';
            $category->department_id = 1;
            $code = \App\Models\ActivityCategory::generateUniqueCode($category);
            return response()->json(['code' => $code, 'success' => true]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'success' => false]);
        }
    });

    // Activity Categories Import Routes (permission protected)
    Route::get('/activity-categories-import', [ActivityCategoryController::class, 'importForm'])
        ->name('activity-categories.import.form')
        ->middleware('permission:activity-category-import');
    Route::post('/activity-categories-import', [ActivityCategoryController::class, 'import'])
        ->name('activity-categories.import')
        ->middleware('permission:activity-category-import');
    Route::get('/activity-categories-import/template', [ActivityCategoryController::class, 'downloadTemplate'])
        ->name('activity-categories.import.template')
        ->middleware('permission:activity-category-import');
    Route::get('/activity-categories-import/new-template', [ActivityCategoryController::class, 'downloadNewTemplate'])
        ->name('activity-categories.download-new-template')
        ->middleware('permission:activity-category-import');

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

    // Activity reports and exports
    Route::get('/activities/reports', [ActivityReportController::class, 'index'])->name('activities.reports');
    Route::get('/activities/export/excel', [ActivityReportController::class, 'exportExcel'])->name('activities.export.excel');

    Route::resource('tasks', TaskController::class);
    Route::put('/tasks/{task}/details', [TaskController::class, 'updateTaskDetails'])->name('tasks.update-details');
    Route::resource('users', UserController::class);
    Route::get('/users/{user}/work-roles', [UserController::class, 'manageWorkRoles'])->name('users.manage-work-roles');
    Route::put('/users/{user}/work-roles', [UserController::class, 'updateWorkRoles'])->name('users.update-work-roles');

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/all', [NotificationController::class, 'showAll'])->name('notifications.show-all');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // API routes for notifications
    Route::get('/api/notifications/all', [NotificationController::class, 'getAllNotifications']);

    // Activity routes
    Route::resource('activities', ActivityController::class);
    // Activity import routes (basic uploader) - permission protected
    Route::get('/activities/import', [ActivityController::class, 'importForm'])
        ->name('activities.import')
        ->middleware('permission:activity-import');
    Route::post('/activities/import', [ActivityController::class, 'import'])
        ->name('activities.import.process')
        ->middleware('permission:activity-import');
    Route::put('/activities/{activity}/start', [ActivityController::class, 'start'])->name('activities.start');
    Route::put('/activities/{activity}/pause', [ActivityController::class, 'pause'])->name('activities.pause');
	Route::put('/activities/{activity}/complete', [ActivityController::class, 'complete'])->name('activities.complete');

    // Activity Monitor (Team view)
    Route::get('/activity-monitor', [ActivityMonitorController::class, 'index'])->name('activity-monitor.index');

    // Activity file routes
    Route::get('/activities/{activity}/files', [ActivityFileController::class, 'index'])->name('activity-files.index');
    Route::post('/activities/{activity}/files', [ActivityFileController::class, 'store'])->name('activity-files.store');
    Route::post('/activities/{activity}/files/multiple', [ActivityFileController::class, 'uploadMultiple'])->name('activity-files.upload-multiple');
    Route::get('/activity-files/{activityFile}', [ActivityFileController::class, 'show'])->name('activity-files.show');
    Route::get('/activity-files/{activityFile}/download', [ActivityFileController::class, 'download'])->name('activity-files.download');
    Route::delete('/activity-files/{activityFile}', [ActivityFileController::class, 'destroy'])->name('activity-files.destroy');

    // Work roles management (NEW SYSTEM)
    Route::get('/work-roles/import', [WorkRoleController::class, 'import'])
        ->name('work-roles.import')
        ->middleware('permission:work-role-import');
    Route::post('/work-roles/import', [WorkRoleController::class, 'importStore'])
        ->name('work-roles.import.store')
        ->middleware('permission:work-role-import');
    Route::resource('work-roles', WorkRoleController::class);
    Route::post('/work-roles/{workRole}/assign-user/{user}', [WorkRoleController::class, 'assignUser'])->name('work-roles.assign-user');
    Route::post('/work-roles/{workRole}/remove-user/{user}', [WorkRoleController::class, 'removeUser'])->name('work-roles.remove-user');

    // Admin routes for role-category management (OLD SYSTEM - deprecated and disabled)
    /*
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/role-categories', [RoleCategoryController::class, 'index'])->name('role-categories.index');
        Route::post('/role-categories/assign', [RoleCategoryController::class, 'assignCategories'])->name('role-categories.assign');
        Route::post('/role-categories/add', [RoleCategoryController::class, 'addCategory'])->name('role-categories.add');
        Route::delete('/role-categories/remove', [RoleCategoryController::class, 'removeCategory'])->name('role-categories.remove');
        Route::get('/role-categories/mappings', [RoleCategoryController::class, 'getMappings'])->name('role-categories.mappings');
    });
    */
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
