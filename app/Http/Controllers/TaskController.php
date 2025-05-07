<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserCrudResource;
use App\Models\Project;
use App\Models\Task;
use App\Http\Resources\TaskResource;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Category;
use Carbon\Carbon;
use App\Http\Resources\CommentResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Task::query();

        // Consistent naming: sort_field instead of short_field
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');
        $perPage = request('per_page', 10); // Add per_page parameter with default of 10

        $user = Auth::user();
        if (!$user->hasRole('Admin')) { // Check if the user does not have the 'admin' role
            $query->where('created_by', $user->id);
        }

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
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
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['created_by'] = Auth::user()->id;
        $data['updated_by'] = Auth::user()->id;
        $data['slug'] = Str::slug($data['name']);

        // Handle image upload
        if ($image) {
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }

        // Create the task
        $task = Task::create($data);

        // Handle file uploads - fix to check for 'files' key directly
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            foreach ($files as $file) {
                $originalName = $file->getClientOriginalName();

                // Store file in public disk
                $storagePath = $file->store('task_files/' . $task->id, 'public');

                // Create file record with consistent field names
                $task->files()->create([
                    'user_id' => Auth::id(),
                    'name' => pathinfo($originalName, PATHINFO_FILENAME),
                    'original_name' => $originalName,
                    'path' => $storagePath,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return to_route("tasks.index")->with("success", "Task has been created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {

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
        $projects = Project::query()->orderBy('name', 'asc')->get();
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
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::user()->id;

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
        $validated = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending', 'in_progress', 'completed'])],
            'scoreType' => ['sometimes', 'required', 'in:creator_rating,assignee_rating'],
            'score' => ['required_with:scoreType', 'integer', 'min:1', 'max:5'],
            'time_spent' => ['sometimes', 'required', 'numeric', 'min:0'],
            'approved_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $updates = [];
        $message = [];

        // Handle task approval
        if (isset($validated['approved_at'])) {
            // Only creator can approve tasks
            if (Auth::id() !== $task->created_by) {
                return response()->json(['error' => 'Only the task creator can approve tasks'], 403);
            }

            // Task must be completed to be approved
            if ($task->status !== 'completed') {
                return response()->json(['error' => 'Only completed tasks can be approved'], 400);
            }

            $updates['approved_at'] = $validated['approved_at'];
            $message[] = 'Task approved successfully';
        }

        // Handle status update
        if (isset($validated['status'])) {
            if ($validated['status'] === 'completed' && $task->status !== 'completed') {
                if (!$request->filled('time_spent')) {
                    return response()->json(['error' => 'Time spent must be provided when completing a task'], 422);
                }
                $updates['completed_at'] = now();
                $updates['time_log'] = $validated['time_spent'];
                $message[] = 'Task marked as completed';
            } elseif ($validated['status'] !== 'completed') {
                $updates['completed_at'] = null;
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

            // Verify user authorization for scoring
            if ($validated['scoreType'] === 'creator_rating') {
                if (Auth::id() !== $task->assigned_user_id) {
                    return response()->json(['error' => 'Unauthorized to give creator rating'], 403);
                }
            } elseif ($validated['scoreType'] === 'assignee_rating') {
                if (Auth::id() !== $task->created_by) {
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
            $query->where("status", request("status"));
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
}
