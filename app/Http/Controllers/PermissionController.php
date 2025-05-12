<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class PermissionController extends Controller
{
    /**
     * Check if the authenticated user has the specified permission
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function check(Request $request)
    {
        $request->validate([
            'permission' => 'required|string',
        ]);

        $permission = $request->permission;
        $user = Auth::user();
        $hasPermission = $user->can($permission);

        return response()->json([
            'permission' => $permission,
            'granted' => $hasPermission,
        ]);
    }

    /**
     * Get all permissions for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPermissions()
    {
        $user = Auth::user();
        $permissions = $user->getAllPermissions()->pluck('name');
        $roles = $user->getRoleNames();

        return response()->json([
            'permissions' => $permissions,
            'roles' => $roles,
        ]);
    }

    /**
     * Get all available permissions in the system
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllPermissions()
    {
        $permissions = Permission::all()->pluck('name');

        return response()->json([
            'permissions' => $permissions,
        ]);
    }

    /**
     * Display the permissions management page
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Only admin can access this
        if (!Auth::user()->hasRole('Admin')) {
            abort(403, 'Unauthorized action.');
        }

        $permissions = Permission::all();

        return Inertia::render('Permission/Index', [
            'permissions' => $permissions,
        ]);
    }
}
