<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Models\Role;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Role::query();

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        $roles = $query->orderBy($sortField, $sortDirection)->paginate(10)->onEachSide(1);

        return inertia("Roles/Index", [
            "roles" => $roles,
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::all();
        return inertia("Roles/Create", [
            "permissions" => $permissions,
            'success' => session('success'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        $role = Role::create([
            'name' => $request->name,
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load('permissions');
        return inertia("Roles/Show", [
            "role" => $role,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $permissions = Permission::all();
        $role->load('permissions');

        return inertia("Roles/Edit", [
            "role" => $role,
            "permissions" => $permissions,
            'success' => session('success'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        $role->update([
            'name' => $request->name,
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete role. It is assigned to users.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
