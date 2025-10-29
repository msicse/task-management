<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\WorkRole;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\ActivityCategory;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\UserPermissionService;
use App\Imports\UserActivityRolesImport;

class WorkRoleController extends Controller
{
    protected $permissionService;

    public function __construct(UserPermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function index(Request $request)
    {
        $query = WorkRole::with(['activityCategories', 'users', 'department'])
            ->withCount('users');

        // Calculate stats for all records (not just current page)
        $baseQuery = WorkRole::query();

        // Apply same search filter for stats if searching
        if ($request->filled('name')) {
            $baseQuery->where('name', 'like', '%' . $request->name . '%');
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Filter by status
        if ($request->filled('status')) {
            $status = $request->status === '1' ? true : false;
            $baseQuery->where('is_active', $status);
            $query->where('is_active', $status);
        }

        // Get stats
        $totalWorkRoles = $baseQuery->count();
        $activeWorkRoles = $baseQuery->where('is_active', true)->count();
        $totalAssignments = $baseQuery->withCount('users')->get()->sum('users_count');

        // Sort functionality
        $sortField = $request->get('sort_field', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');

        $validSortFields = ['name', 'created_at', 'is_active'];
        if (in_array($sortField, $validSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        $workRoles = $query->paginate(10)->onEachSide(1);

        return Inertia::render('WorkRoles/Index', [
            'workRoles' => $workRoles,
            'stats' => [
                'totalWorkRoles' => $totalWorkRoles,
                'activeWorkRoles' => $activeWorkRoles,
                'totalAssignments' => $totalAssignments,
            ],
            'queryParams' => $request->only(['name', 'status', 'sort_field', 'sort_direction']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        $categories = ActivityCategory::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();

        return Inertia::render('WorkRoles/Create', [
            'categories' => $categories,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_roles',
            'description' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'categories' => 'array',
            'categories.*' => 'exists:activity_categories,id',
        ]);

        $workRole = WorkRole::create($request->only(['name', 'description', 'department_id']));

        if ($request->has('categories')) {
            $workRole->activityCategories()->sync($request->categories);
        }

        return redirect()->route('work-roles.index')
            ->with('success', 'Work role created successfully.');
    }

    public function show(WorkRole $workRole, Request $request)
    {
        $workRole->load(['activityCategories', 'users', 'department']);

        // Get users currently assigned to this work role
        $assignedUsers = $workRole->users;

        // Get users not assigned to this work role with search functionality
        $availableUsersQuery = User::whereNotIn('id', $assignedUsers->pluck('id'));

        // Apply search filter if provided
        if ($request->filled('user_search')) {
            $search = $request->user_search;
            $availableUsersQuery->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $availableUsers = $availableUsersQuery
            ->orderBy('name')
            ->limit(20) // Limit to 20 users for performance
            ->get(['id', 'name', 'email']);

        return Inertia::render('WorkRoles/Show', [
            'workRole' => $workRole,
            'users' => $assignedUsers,
            'availableUsers' => $availableUsers,
            'queryParams' => $request->only(['user_search']),
        ]);
    }

    public function edit(WorkRole $workRole)
    {
        $workRole->load(['activityCategories']);
        $categories = ActivityCategory::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();

        return Inertia::render('WorkRoles/Edit', [
            'workRole' => $workRole,
            'categories' => $categories,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, WorkRole $workRole)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_roles,name,' . $workRole->id,
            'description' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'categories' => 'array',
            'categories.*' => 'exists:activity_categories,id',
        ]);

        $workRole->update($request->only(['name', 'description', 'department_id']));

        if ($request->has('categories')) {
            $workRole->activityCategories()->sync($request->categories);
        }

        return redirect()->route('work-roles.index')
            ->with('success', 'Work role updated successfully.');
    }

    public function destroy(WorkRole $workRole)
    {
        $workRole->delete();

        return redirect()->route('work-roles.index')
            ->with('success', 'Work role deleted successfully.');
    }

    public function assignUser(WorkRole $workRole, User $user)
    {
        // Check if user is already assigned to this work role
        if (!$workRole->users()->where('user_id', $user->id)->exists()) {
            $workRole->users()->attach($user->id);
            $message = "User {$user->name} has been assigned to work role {$workRole->name}.";
        } else {
            $message = "User {$user->name} is already assigned to this work role.";
        }

        return redirect()->route('work-roles.show', $workRole)
            ->with('success', $message);
    }

    public function removeUser(WorkRole $workRole, User $user)
    {
        $workRole->users()->detach($user->id);

        return redirect()->route('work-roles.show', $workRole)
            ->with('success', "User {$user->name} has been removed from work role {$workRole->name}.");
    }


    public function import()
    {
        return Inertia::render('WorkRoles/Import');
    }
    public function importStore(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        // Handle the file upload and import logic here
        $file = $request->file('file');

        try {
            $import = new UserActivityRolesImport();
            Excel::import($import, $request->file('file'));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['file' => 'Error importing file: ' . $e->getMessage()]);
        }

        return redirect()->route('work-roles.index')
            ->with('success', 'Work roles and user assignments imported successfully.');
    }
}
