<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;


class UserController extends Controller
{

    function __construct()
    {
        $this->middleware('permission:user-list|user-create|user-edit|user-delete', ['only' => ['index', 'store']]);
        $this->middleware('permission:user-create', ['only' => ['create', 'store']]);
        $this->middleware('permission:user-edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:user-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPage = request('per_page', 10);

        $users = User::with(['department', 'createdBy', 'updatedBy', 'roles'])
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%");
                });
            })
            ->when(request('department'), function ($query, $department) {
                $query->where('department_id', $department);
            })
            ->when(request('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when(request('sort_field') && request('sort_direction'), function ($query) {
                $sortField = request('sort_field');
                $direction = request('sort_direction');

                // Handle special sorting for department and role
                if ($sortField === 'department_id') {
                    $query->join('departments', 'users.department_id', '=', 'departments.id')
                        ->orderBy('departments.name', $direction)
                        ->select('users.*');
                } else if ($sortField === 'role') {
                    $query->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                        ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
                        ->where('model_has_roles.model_type', 'App\\Models\\User')
                        ->orderBy('roles.name', $direction)
                        ->select('users.*');
                } else {
                    $query->orderBy($sortField, $direction);
                }
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('User/Index', [
            'users' => $users,
            'departments' => Department::orderBy('name')->get(),
            'filters' => request()->only(['search', 'department', 'status', 'sort_field', 'sort_direction', 'per_page']),
            'success' => session('success')
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('User/Create', [
            'departments' => Department::orderBy('name')->get(),
            'roles' => Role::orderBy('name')->get(),
            'workRoles' => \App\Models\WorkRole::where('is_active', true)->orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $roleIds = array_map('intval', $data['role_ids']);
        $workRoleIds = isset($data['work_role_ids']) ? array_map('intval', $data['work_role_ids']) : [];

        unset($data['role_ids'], $data['work_role_ids']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('users', 'public');
        }

        $user = User::create($data);
        $user->assignRole($roleIds);

        // Assign work roles if provided
        if (!empty($workRoleIds)) {
            $user->workRoles()->sync($workRoleIds);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['department', 'createdBy', 'updatedBy', 'roles']);
        $tasks = $user->tasks()
            ->with(['assignedUser', 'createdBy', 'project'])
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('User/Show', [
            'user' => $user,
            'tasks' => $tasks
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('User/Edit', [
            'user' => $user->load(['roles', 'workRoles']),
            'departments' => Department::orderBy('name')->get(),
            'roles' => Role::orderBy('name')->get(),
            'workRoles' => \App\Models\WorkRole::where('is_active', true)->orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();
        $roleIds = array_map('intval', $data['role_ids']);
        $workRoleIds = isset($data['work_role_ids']) ? array_map('intval', $data['work_role_ids']) : [];

        unset($data['role_ids'], $data['work_role_ids']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('users', 'public');
        }

        $user->update($data);
        $user->syncRoles($roleIds);

        // Sync work roles
        $user->workRoles()->sync($workRoleIds);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Show the form for managing work roles for a user.
     */
    public function manageWorkRoles(User $user)
    {
        $workRoles = \App\Models\WorkRole::with(['department', 'activityCategories'])
            ->orderBy('name')
            ->get();

        $userWorkRoles = $user->workRoles;

        return Inertia::render('User/ManageWorkRoles', [
            'user' => $user,
            'workRoles' => $workRoles,
            'userWorkRoles' => $userWorkRoles,
        ]);
    }

    /**
     * Update work roles for a user.
     */
    public function updateWorkRoles(Request $request, User $user)
    {
        $request->validate([
            'work_roles' => 'array',
            'work_roles.*' => 'exists:work_roles,id',
        ]);

        $workRoleIds = $request->input('work_roles', []);

        // Debug logging
        \Log::info('Work roles update attempt', [
            'user_id' => $user->id,
            'work_roles_input' => $workRoleIds,
            'request_data' => $request->all()
        ]);

        // Sync work roles (this will add new ones and remove old ones)
        $user->workRoles()->sync($workRoleIds);

        $workRoleNames = \App\Models\WorkRole::whereIn('id', $workRoleIds)
            ->pluck('name')
            ->toArray();

        $message = count($workRoleIds) > 0
            ? "User {$user->name} has been assigned to work roles: " . implode(', ', $workRoleNames)
            : "All work roles have been removed from user {$user->name}.";

        return redirect()->route('users.manage-work-roles', $user)
            ->with('success', $message);
    }
}
