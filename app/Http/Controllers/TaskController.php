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


class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Task::query();

        $shortField = request("short_field", 'created_at');
        $shortDirection = request("short_direction", 'desc');

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
        }
        $tasks = $query->orderBy($shortField, $shortDirection)->paginate(10)->onEachSide(1);
        return inertia("Task/Index", [
            "tasks" => TaskResource::collection($tasks),
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

        // Handle image upload
        if ($image) {
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }

        // Create the task
        $task = Task::create($data);

        return to_route("tasks.index")->with("success", "Task has been created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $task->load(['assignedUser', 'createdBy', 'updatedBy', 'project', 'files.user']);

        // Add dummy comments for demonstration
        $comments = collect([
            [
                'id' => 1,
                'content' => 'I\'ve started working on this task. Will update progress soon.',
                'created_at' => now()->subDays(2),
                'user' => [
                    'name' => 'John Doe',
                    'avatar' => 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
                ],
                'replies' => [
                    [
                        'id' => 2,
                        'content' => 'Great! Let me know if you need any help.',
                        'created_at' => now()->subDays(1),
                        'user' => [
                            'name' => 'Jane Smith',
                            'avatar' => 'https://ui-avatars.com/api/?name=Jane+Smith&background=7C3AED&color=fff'
                        ]
                    ],
                    [
                        'id' => 3,
                        'content' => 'Thanks! I\'ll keep you posted.',
                        'created_at' => now()->subHours(12),
                        'user' => [
                            'name' => 'John Doe',
                            'avatar' => 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
                        ]
                    ]
                ]
            ],
            [
                'id' => 4,
                'content' => 'I\'ve reviewed the requirements. Everything looks clear.',
                'created_at' => now()->subHours(6),
                'user' => [
                    'name' => 'Mike Johnson',
                    'avatar' => 'https://ui-avatars.com/api/?name=Mike+Johnson&background=059669&color=fff'
                ],
                'replies' => []
            ],
            [
                'id' => 5,
                'content' => 'Progress update: Completed 50% of the task. Will finish by tomorrow.',
                'created_at' => now()->subHours(2),
                'user' => [
                    'name' => 'John Doe',
                    'avatar' => 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
                ],
                'replies' => [
                    [
                        'id' => 6,
                        'content' => 'That\'s great progress! Keep up the good work.',
                        'created_at' => now()->subHour(),
                        'user' => [
                            'name' => 'Sarah Wilson',
                            'avatar' => 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff'
                        ]
                    ]
                ]
            ]
        ]);

        // Format files for the view
        $files = $task->files->map(function ($file) {
            return [
                'id' => $file->id,
                'original_name' => $file->original_name,
                'mime_type' => $file->mime_type,
                'size_for_humans' => $file->getFileSizeForHumans(),
                'icon' => $file->getFileIcon(),
                'created_at' => $file->created_at,
                'user' => [
                    'name' => $file->user->name,
                ],
            ];
        });

        return Inertia::render('Task/Show', [
            'task' => new TaskResource($task),
            'comments' => $comments,
            'files' => $files,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        $projects = Project::query()->orderBy('name', 'asc')->get();
        $users = User::query()->orderBy('name', 'asc')->get();

        return inertia("Task/Edit", [
            "task" => new TaskResource($task),
            "projects" => ProjectResource::collection($projects),
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

        if ($task->image_path) {
            Storage::disk('public')->deleteDirectory(dirname($task->image_path));
        }
        if ($image) {
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }
        $task->update($data);

        return to_route("tasks.index")->with("success", ("Task \"$task->name\" is updated"));
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


    public function myTasks()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $query = Task::query()->where('assigned_user_id', $user->id);

        $shortField = request("short_field", 'created_at');
        $shortDirection = request("short_direction", 'desc');

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
        }
        $tasks = $query->orderBy($shortField, $shortDirection)->paginate(10)->onEachSide(1);
        return inertia("Task/Index", [
            "tasks" => TaskResource::collection($tasks),
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }
}
