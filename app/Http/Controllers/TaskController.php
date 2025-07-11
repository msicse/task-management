<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Category;
use App\Models\TaskFile;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Resources\CommentResource;
use App\Http\Resources\ProjectResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\UserCrudResource;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TaskImport;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Exports\TasksExport;
use Illuminate\Database\Eloquent\Builder;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\TaskStatusUpdatedNotification;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskApprovedNotification;

class TaskController extends Controller
{
    // Permission map for all controller methods
    protected $permissionMap = [
        'index' => 'task-list',
        'show' => 'task-view',
        'create' => 'task-create',
        'store' => 'task-create',
        'edit' => 'task-edit',
        'update' => 'task-edit',
        'destroy' => 'task-delete',
        'myTasks' => 'task-view-own',
        'showImportForm' => 'task-import',
        'import' => 'task-import',
        'showReportsPage' => 'task-reports',
        'exportExcel' => 'task-export',
        'exportPdf' => 'task-export',
        'generateTaskPdf' => 'task-generate-pdf',
        'updateTaskDetails' => 'task-complete|task-approve',
    ];

    /**
     * Check if user has the given permissions
     * @param string|array $permissions
     * @return bool
     */
    protected function checkPermission($permissions)
    {
        $user = Auth::user();

        if (is_string($permissions)) {
            $permissions = explode('|', $permissions);
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermissionTo($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Authorize the action based on the current method
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function authorizeAction($method = null)
    {
        // Get the called method name if not provided
        if (!$method) {
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
            $method = $backtrace[1]['function'] ?? null;
        }

        // Check if method has permissions defined
        if (isset($this->permissionMap[$method])) {
            $permissions = $this->permissionMap[$method];

            if (!$this->checkPermission($permissions)) {
                abort(403, 'Unauthorized action. You do not have the necessary permissions.');
            }
        }
    }

    /**
     * Authorize the action based on specific permissions
     * @param string|array $permissions
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function authorizePermission($permissions)
    {
        if (!$this->checkPermission($permissions)) {
            abort(403, 'Unauthorized action. You do not have the necessary permissions.');
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorizeAction();

        $query = Task::query();

        // Consistent naming: sort_field instead of short_field
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');
        $perPage = request('per_page', 10); // Add per_page parameter with default of 10

        $user = Auth::user();

        if (!$user->hasRole('Admin') && !$user->hasRole('Team Leader')) { // Check if the user does not have the 'admin' role
            $query->where('created_by', $user->id);
        }

        // if (request("name")) {
        //     $query->where("name", "like", "%" . request("name") . "%");
        // }
        if (request("name")) {
            // Try to find tasks by name first
            $query->where(function ($q) {
                $q->where("name", "like", "%" . request("name") . "%")
                    ->orWhere("factory_id", "like", "%" . request("name") . "%");
            });
        }
        if (request("status")) {
            if (request("status") === "waiting_for_approval") {
                // Find tasks with status "completed" but approved_at is null
                $query->where("status", "completed")
                    ->whereNull("approved_at");
            } else {
                $query->where("status", request("status"));
            }
        }
        if (request("priority")) {
            $query->where("priority", request("priority"));
        }
        if (request("assigned_to")) {
            $query->where("assigned_user_id", request("assigned_to"));
        }
        if (request("category")) {
            $query->where("category_id", request("category"));
        }

        // Implement pagination with dynamic per_page parameter and consistent naming
        $tasks = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString()
            ->onEachSide(2);

        // Fix for pagination not showing with fewer records than per_page
        // Ensure that we always have pagination metadata even with few records
        $tasks->setPath(request()->url());

        $users = User::query()->orderBy('name', 'asc')->get();
        $categories = Category::query()->orderBy('name', 'asc')->get();

        // Use collection resource for proper pagination data formatting
        $paginatedTasks = TaskResource::collection($tasks);
        $paginatedTasks = $paginatedTasks->response()->getData(true);

        return inertia("Task/Index", [
            "tasks" => $paginatedTasks,
            "users" => $users,
            'categories' => $categories,
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorizeAction();

        $categories = Category::query()->orderBy('name', 'asc')->get();
        $users = User::query()->orderBy('name', 'asc')->get();

        return inertia("Task/Create", [
            "categories" => $categories,
            "users" => UserCrudResource::collection($users),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $this->authorizeAction();

        $data = $request->validated();
        $image = $data['image'] ?? null;
        $currentUser = Auth::user();
        $data['created_by'] = $currentUser->id;
        $data['updated_by'] = $currentUser->id;
        $data['slug'] = Str::slug($data['name']);

        $date = Carbon::parse($data['due_date']);
        $currentTime = Carbon::now()->format('H:i:s'); // Get current time (e.g., 14:35:00)

        $dueDateWithTime = Carbon::parse($date->format('Y-m-d') . ' ' . $currentTime);
        $data['due_date'] = $dueDateWithTime;

        // Handle image upload
        if ($image) {
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }

        // Create the task
        $task = Task::create($data);

        // Handle file uploads if any
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileName = Str::random(40) . '.' . $extension;

                // Store the file
                $path = $file->storeAs('task-files/' . $task->id, $fileName, 'public');

                // Create database record
                TaskFile::create([
                    'task_id' => $task->id,
                    'user_id' => Auth::id(),
                    'name' => $fileName,
                    'original_name' => $originalName,
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        // Notify the assigned user about the new task
        if (isset($data['assigned_user_id'])) {
            $assignedUser = User::find($data['assigned_user_id']);
            if ($assignedUser && $assignedUser->id !== $currentUser->id) {
                $assignedUser->notify(new TaskAssignedNotification($task, $currentUser));
            }
        }

        return to_route("tasks.index")->with([
            "success" => "Task has been created successfully",
            "taskId" => $task->id
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorizeAction();

        // Additional check for viewing own tasks
        if (
            !Auth::user()->can('task-view') &&
            Auth::user()->can('task-view-own') &&
            Auth::id() !== $task->created_by &&
            Auth::id() !== $task->assigned_user_id
        ) {
            abort(403, 'You can only view your own tasks');
        }

        $task->load(['assignedUser', 'createdBy', 'updatedBy', 'category']);

        // Get comments with their replies and user information
        $comments = $task->comments()
            ->whereNull('parent_id')  // Get only top-level comments
            ->with(['user', 'replies.user'])  // Eager load relationships
            ->get();

        // Load files with user information
        $files = $task->files()
            ->with('user')
            ->latest()
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'original_name' => $file->original_name,
                    'mime_type' => $file->mime_type,
                    'size_for_humans' => $file->getFileSizeForHumans(),
                    'icon' => $file->getFileIcon(),
                    'created_at' => $file->created_at->format('d-m-Y'),
                    'user' => [
                        'name' => $file->user->name,
                    ],
                ];
            });

        return inertia('Task/Show', [
            'task' => new TaskResource($task),
            'comments' => CommentResource::collection($comments),
            'files' => $files,
            'success' => session('success'),  // Add this line to pass success message
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        $this->authorizeAction();

        // Additional check for editing own tasks
        if (
            !Auth::user()->can('task-edit') &&
            Auth::user()->can('task-update-own') &&
            Auth::id() !== $task->created_by
        ) {
            abort(403, 'You can only edit your own tasks');
        }

        // $projects = Project::query()->orderBy('name', 'asc')->get();
        $categories = Category::query()->orderBy('name', 'asc')->get();
        $users = User::query()->orderBy('name', 'asc')->get();

        return inertia("Task/Edit", [
            "categories" => $categories,
            "task" => new TaskResource($task),
            "users" => UserCrudResource::collection($users),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorizeAction();

        // Additional check for updating own tasks
        if (
            !Auth::user()->can('task-edit') &&
            Auth::user()->can('task-update-own') &&
            Auth::id() !== $task->created_by
        ) {
            abort(403, 'You can only update tasks you created');
        }

        $data = $request->validated();
        $image = $data['image'] ?? null;
        $currentUser = Auth::user();
        $data['updated_by'] = $currentUser->id;

        // Store original values for comparison
        $previousStatus = $task->status;
        $previousAssignedUserId = $task->assigned_user_id;

        // Handle status change and completion date
        if (isset($data['status'])) {
            if ($data['status'] === 'completed' && $task->status !== 'completed') {
                $data['completed_at'] = now();
            } elseif ($data['status'] !== 'completed') {
                $data['completed_at'] = null;
            }
        }

        // Handle scoring - removed redundant assignments
        if (Auth::id() === $task->created_by && isset($data['assignor_score'])) {
            // score is already in $data['assignor_score'], no need to reassign
        }
        if (Auth::id() === $task->assigned_user_id && isset($data['assignee_score'])) {
            // score is already in $data['assignee_score'], no need to reassign
        }

        // Handle image update
        if ($image) {
            if ($task->image_path) {
                Storage::disk('public')->deleteDirectory(dirname($task->image_path));
            }
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }

        $task->update($data);

        // Send notifications based on what changed

        // 1. If task was reassigned to a new user
        if (isset($data['assigned_user_id']) && $data['assigned_user_id'] != $previousAssignedUserId) {
            $assignedUser = User::find($data['assigned_user_id']);
            if ($assignedUser && $assignedUser->id !== $currentUser->id) {
                $assignedUser->notify(new TaskAssignedNotification($task, $currentUser));
            }
        }

        // 2. If status was changed
        if (isset($data['status']) && $data['status'] !== $previousStatus) {
            // Notify task creator if they didn't make the change
            if ($task->created_by !== $currentUser->id) {
                $creator = User::find($task->created_by);
                $creator->notify(new TaskStatusUpdatedNotification($task, $currentUser, $previousStatus));
            }

            // Notify assigned user if they didn't make the change
            if ($task->assigned_user_id !== $currentUser->id) {
                $assignedUser = User::find($task->assigned_user_id);
                $assignedUser->notify(new TaskStatusUpdatedNotification($task, $currentUser, $previousStatus));
            }

            // If task was completed, send completion notification to the creator
            if ($data['status'] === 'completed' && $previousStatus !== 'completed') {
                $creator = User::find($task->created_by);
                if ($creator && $creator->id !== $currentUser->id) {
                    $creator->notify(new TaskCompletedNotification($task, $currentUser, $data['time_log'] ?? null));
                }
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Task updated successfully']);
        }

        return to_route("tasks.index")->with("success", "Task \"$task->name\" is updated");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorizeAction();

        // Only Admin or task creator with delete permission can delete tasks
        $user = Auth::user();
        if (!$user->hasRole('Admin') && $task->created_by !== $user->id) {
            abort(403, 'You can only delete tasks you created');
        }

        $name = $task->name;
        $task->delete();
        if ($task->image_path) {
            Storage::disk("public")->deleteDirectory(dirname($task->image_path));
        }

        return to_route('tasks.index')->with('success', ("Task \"$name\" was deleted"));
    }

    /**
     * Update task details including status, score, time logging, and approval
     */
    public function updateTaskDetails(Request $request, Task $task)
    {
        $this->authorizeAction();

        $validated = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending', 'in_progress', 'completed'])],
            'scoreType' => ['sometimes', 'required', 'in:creator_rating,assignee_rating'],
            'score' => ['required_with:scoreType', 'integer', 'min:1', 'max:5'],
            'time_spent' => ['sometimes', 'required', 'numeric', 'min:0'],
            'approved_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $updates = [];
        $message = [];
        $currentUser = Auth::user();

        // Store original status for notifications
        $previousStatus = $task->status;

        // Handle task approval
        if (isset($validated['approved_at'])) {
            // Check if user has task-approve permission
            if (!$currentUser->can('task-approve')) {
                return response()->json(['error' => 'You do not have permission to approve tasks'], 403);
            }

            // Only creator or admin/manager can approve tasks
            if ($currentUser->id !== $task->created_by && !$currentUser->hasRole(['Admin', 'Manager'])) {
                return response()->json(['error' => 'Only the task creator or a manager can approve tasks'], 403);
            }

            // Task must be completed to be approved (status is stored as "completed" in the database)
            if ($task->status !== 'completed' || !$task->completed_at) {
                return response()->json(['error' => 'Only completed tasks can be approved'], 400);
            }

            $updates['approved_at'] = $validated['approved_at'];
            $message[] = 'Task approved successfully';
        }

        // Handle status update
        if (isset($validated['status'])) {
            // Mark as completed - requires task-complete permission
            if ($validated['status'] === 'completed' && $task->status !== 'completed') {
                // Check permission to complete tasks
                if (!$currentUser->can('task-complete')) {
                    return response()->json(['error' => 'You do not have permission to complete tasks'], 403);
                }

                // Only assigned user, creator, or manager can mark as complete
                if (
                    $currentUser->id !== $task->assigned_user_id &&
                    $currentUser->id !== $task->created_by &&
                    !$currentUser->hasRole(['Admin', 'Manager'])
                ) {
                    return response()->json(['error' => 'Only the assigned user, task creator, or a manager can mark a task as complete'], 403);
                }

                if (!$request->filled('time_spent')) {
                    return response()->json(['error' => 'Time spent must be provided when completing a task'], 422);
                }
                $updates['completed_at'] = now();
                $updates['time_log'] = $validated['time_spent'];
                $message[] = 'Task marked as completed';
            }
            // Change from completed to another status - requires higher permission
            elseif ($validated['status'] !== 'completed' && $task->status === 'completed') {
                // Only admin/manager/creator can change from completed
                if (!$currentUser->hasRole(['Admin', 'Manager']) && $currentUser->id !== $task->created_by) {
                    return response()->json(['error' => 'Only a manager or the task creator can change a completed task status'], 403);
                }

                $updates['completed_at'] = null;
            }
            // Regular status update - check edit permission
            else {
                // Check if user has edit permission or is updating own task
                if (
                    !$currentUser->can('task-edit') &&
                    (!$currentUser->can('task-update-own') || $currentUser->id !== $task->created_by) &&
                    $currentUser->id !== $task->assigned_user_id
                ) {
                    return response()->json(['error' => 'You do not have permission to update this task status'], 403);
                }
            }

            $updates['status'] = $validated['status'];
            $message[] = 'Status updated';
        }

        // Handle scoring
        if (isset($validated['scoreType'])) {
            // Verify task is completed before allowing scoring
            if ($task->status !== 'completed' && (!isset($validated['status']) || $validated['status'] !== 'completed')) {
                return response()->json(['error' => 'Can only score completed tasks'], 400);
            }

            // Check permissions for scoring based on type
            if ($validated['scoreType'] === 'creator_rating') {
                if (!$currentUser->can('assignee-score-create')) {
                    return response()->json(['error' => 'You do not have permission to rate the task creator'], 403);
                }

                // Only task assignee can rate the creator
                if ($currentUser->id !== $task->assigned_user_id && !$currentUser->hasRole('Admin')) {
                    return response()->json(['error' => 'Only the assigned user can rate the task creator'], 403);
                }
            } else if ($validated['scoreType'] === 'assignee_rating') {
                if (!$currentUser->can('assignor-score-create')) {
                    return response()->json(['error' => 'You do not have permission to rate the task assignee'], 403);
                }

                // Only task creator can rate the assignee
                if ($currentUser->id !== $task->created_by && !$currentUser->hasRole('Admin')) {
                    return response()->json(['error' => 'Only the task creator can rate the assignee'], 403);
                }
            }

            // Verify user authorization for scoring
            if ($validated['scoreType'] === 'creator_rating') {
                if ($currentUser->id !== $task->assigned_user_id) {
                    return response()->json(['error' => 'Unauthorized to give creator rating'], 403);
                }
            } elseif ($validated['scoreType'] === 'assignee_rating') {
                if ($currentUser->id !== $task->created_by) {
                    return response()->json(['error' => 'Unauthorized to give assignee rating'], 403);
                }
            }

            $updates[$validated['scoreType']] = $validated['score'];
            $message[] = 'Score updated';
        }

        // Update time spent independently if provided without completion
        if (isset($validated['time_spent']) && !isset($updates['time_log'])) {
            $updates['time_log'] = $validated['time_spent'];
            $message[] = 'Time spent updated';
        }

        if (!empty($updates)) {
            $task->update($updates);

            // Send notifications based on what was updated

            // 1. Send status change notification
            if (isset($updates['status']) && $updates['status'] !== $previousStatus) {
                // Notify relevant users about status change
                if ($task->created_by !== $currentUser->id) {
                    $creator = User::find($task->created_by);
                    if ($creator) {
                        $creator->notify(new TaskStatusUpdatedNotification($task, $currentUser, $previousStatus));
                    }
                }

                if ($task->assigned_user_id !== $currentUser->id) {
                    $assignedUser = User::find($task->assigned_user_id);
                    if ($assignedUser) {
                        $assignedUser->notify(new TaskStatusUpdatedNotification($task, $currentUser, $previousStatus));
                    }
                }

                // If task was just completed, send completion notification to creator
                if ($updates['status'] === 'completed' && $previousStatus !== 'completed') {
                    // Notify the task creator about completion if they didn't make the update
                    if ($task->created_by !== $currentUser->id) {
                        $creator = User::find($task->created_by);
                        if ($creator) {
                            $creator->notify(new TaskCompletedNotification($task, $currentUser, $updates['time_log'] ?? null));
                        }
                    }
                }
            }

            // 2. Send task approval notification
            if (isset($updates['approved_at'])) {
                // Notify the assigned user about task approval
                $assignedUser = User::find($task->assigned_user_id);
                if ($assignedUser && $assignedUser->id !== $currentUser->id) {
                    $assignedUser->notify(new TaskApprovedNotification(
                        $task,
                        $currentUser,
                        $updates['assignee_rating'] ?? $task->assignee_rating
                    ));
                }
            }

            $successMessage = implode(', ', $message);

            // Return JSON response for XHR requests
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => $successMessage,
                    'task' => new TaskResource($task)
                ]);
            }

            // Return Inertia redirect for normal requests
            return redirect()->back()->with('success', $successMessage);
        }

        if ($request->wantsJson()) {
            return response()->json(['error' => 'No updates provided'], 400);
        }

        return redirect()->back()->with('error', 'No updates provided');
    }

    public function myTasks()
    {
        $this->authorizeAction();

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $query = Task::query()->where('assigned_user_id', $user->id);

        // Consistent naming and parameters
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');
        $perPage = request('per_page', 10);

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            if (request("status") === "waiting_for_approval") {
                // Find tasks with status "completed" but approved_at is null
                $query->where("status", "completed")
                    ->whereNull("approved_at");
            } else {
                $query->where("status", request("status"));
            }
        }
        if (request("priority")) {
            $query->where("priority", request("priority"));
        }
        if (request("category")) {
            $query->where("category_id", request("category"));
        }

        $tasks = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString()
            ->onEachSide(2);

        // Fix for pagination not showing with fewer records than per_page
        // Ensure that we always have pagination metadata even with few records
        $tasks->setPath(request()->url());

        $users = User::query()->orderBy('name', 'asc')->get();

        // Use collection resource for proper pagination data formatting
        $paginatedTasks = TaskResource::collection($tasks);
        $paginatedTasks = $paginatedTasks->response()->getData(true);

        return inertia("Task/MyTasks", [
            "tasks" => $paginatedTasks,
            "users" => $users,
            'categories' => Category::query()->orderBy('name', 'asc')->get(),
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Handle bulk task import via Excel/CSV file
     */
    public function import(Request $request)
    {
        $this->authorizeAction();

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:2048',
        ]);

        try {
            Excel::import(new TaskImport, $request->file('file'));

            return redirect()->route('tasks.index')->with('success', 'Tasks imported successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to import tasks: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the task import form
     */
    public function showImportForm()
    {
        $this->authorizeAction();

        return inertia('Task/Import');
    }

    /**
     * Export tasks to Excel/CSV file
     */
    public function export(Request $request)
    {
        $query = Task::query();

        $user = Auth::user();
        if (!$user->hasRole('Admin')) {
            $query->where('created_by', $user->id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_user_id', $request->input('assigned_to'));
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        $tasks = $query->get();

        // Generate and return the Excel file
        return Excel::download(new TasksExport($tasks), 'tasks_' . now()->format('Ymd_His') . '.xlsx');
    }

    /**
     * Show the task export form
     */
    public function showExportForm()
    {
        $this->authorizeAction();

        $users = User::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();

        // Use Reports page instead if Export page doesn't exist
        return inertia('Task/Reports', [
            'users' => $users,
            'categories' => $categories,
            'exportMode' => true,
        ]);
    }

    /**
     * Show the reports page
     */
    public function showReportsPage()
    {
        $this->authorizeAction();

        $users = User::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();

        return inertia('Task/Reports', [
            'users' => $users,
            'categories' => $categories,
            'success' => session('success'),
        ]);
    }

    /**
     * Export tasks to Excel based on filters
     */
    public function exportExcel(Request $request)
    {
        $this->authorizeAction();

        $query = $this->getFilteredTasksQuery($request);
        $tasks = $query->with(['category', 'assignedUser', 'createdBy'])->get();

        // Generate and return the Excel file
        return Excel::download(
            new TasksExport($tasks),
            'tasks_report_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

    /**
     * Export tasks to PDF based on filters
     */
    public function exportPdf(Request $request)
    {
        $this->authorizeAction();

        $query = $this->getFilteredTasksQuery($request);
        $tasks = $query->with(['category', 'assignedUser', 'createdBy'])->get();

        $filters = $request->only(['name', 'status', 'priority', 'assigned_to', 'category', 'date_range']);

        // Process date range if provided
        if (!empty($filters['date_range']) && strpos($filters['date_range'], '|') !== false) {
            list($startDate, $endDate) = explode('|', $filters['date_range']);
            $filters['date_range'] = "From $startDate to $endDate";
        }

        $pdf = PDF::loadView('tasks.report_list', [
            'tasks' => $tasks,
            'filters' => $filters,
        ]);

        return $pdf->download('tasks_report_' . now()->format('Ymd_His') . '.pdf');
    }

    /**
     * Generate a PDF report for the specified task.
     */
    public function generateTaskPdf(Task $task)
    {
        $this->authorizeAction();

        // Check if user has permission to view this task
        $currentUser = Auth::user();
        if (
            !$currentUser->can('task-view') &&
            !($currentUser->can('task-view-own') &&
                ($currentUser->id === $task->created_by || $currentUser->id === $task->assigned_user_id))
        ) {
            abort(403, 'You do not have permission to generate PDF for this task');
        }

        $task->load(['assignedUser', 'createdBy', 'updatedBy', 'category', 'comments.user', 'files']);

        $pdf = PDF::loadView('tasks.report', [
            'task' => $task,
        ]);

        return $pdf->download('task_report_' . $task->id . '.pdf');
    }

    /**
     * Helper method to get filtered tasks query based on request parameters
     */
    private function getFilteredTasksQuery(Request $request)
    {
        $query = Task::query();

        $user = Auth::user();

        // Apply permission-based filtering
        if ($user->can('task-list')) {
            // If user has task-list permission but is not an Admin,
            // they can still see all tasks but not from other departments
            if (!$user->hasRole('Admin') && $user->hasRole(['Manager', 'Team Leader'])) {
                // TODO: Add department-based filtering here if needed
                // For now, managers and team leaders can see all tasks
            }
            // Regular employees with task-list see only their tasks
            else if (!$user->hasRole(['Admin', 'Manager', 'Team Leader'])) {
                $query->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                        ->orWhere('assigned_user_id', $user->id);
                });
            }
        }
        // Users with only task-view-own permission can only see their own tasks
        else if ($user->can('task-view-own')) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhere('assigned_user_id', $user->id);
            });
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_user_id', $request->input('assigned_to'));
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        // Handle date range filtering
        if ($request->filled('date_range') && strpos($request->input('date_range'), '|') !== false) {
            list($startDate, $endDate) = explode('|', $request->input('date_range'));
            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }
        }

        return $query;
    }
}
