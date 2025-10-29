<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Spatie\Permission\Models\Role;
use App\Models\ActivityCategory;

class RoleCategoryController extends Controller
{
    /**
     * Display the role-category management page
     */
    public function index(): InertiaResponse
    {
        $roles = Role::orderBy('name')->get();
        $categories = ActivityCategory::orderBy('name')->get();

        // Get role-category assignments from pivot table
        $assignments = \DB::table('activity_category_role')
            ->select('role_id', 'activity_category_id')
            ->get()
            ->groupBy('role_id');

        // Transform roles for frontend
        $rolesWithCategories = $roles->map(function ($role) use ($assignments) {
            $categoryIds = $assignments->has($role->id)
                ? $assignments[$role->id]->pluck('activity_category_id')->toArray()
                : [];

            return [
                'id' => $role->id,
                'name' => $role->name,
                'categories' => $categoryIds
            ];
        });

        return Inertia::render('Admin/RoleCategories', [
            'roles' => $rolesWithCategories,
            'categories' => $categories
        ]);
    }    /**
     * Assign categories to a role
     */
    public function assignCategories(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:activity_categories,id'
        ]);

        $role = Role::findOrFail($validated['role_id']);

        // Remove existing assignments
        \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->delete();

        // Add new assignments
        foreach ($validated['category_ids'] as $categoryId) {
            \DB::table('activity_category_role')->insert([
                'role_id' => $validated['role_id'],
                'activity_category_id' => $categoryId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Get updated category IDs
        $categoryIds = \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->pluck('activity_category_id')
            ->toArray();

        return response()->json([
            'message' => 'Categories assigned successfully!',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'categories' => $categoryIds
            ]
        ]);
    }

    /**
     * Remove category from role
     */
    public function removeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'category_id' => 'required|exists:activity_categories,id'
        ]);

        $role = Role::findOrFail($validated['role_id']);

        // Remove the specific assignment
        \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->where('activity_category_id', $validated['category_id'])
            ->delete();

        // Get updated category IDs
        $categoryIds = \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->pluck('activity_category_id')
            ->toArray();

        return response()->json([
            'message' => 'Category removed successfully!',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'categories' => $categoryIds
            ]
        ]);
    }

    /**
     * Add single category to role
     */
    public function addCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'category_id' => 'required|exists:activity_categories,id'
        ]);

        $role = Role::findOrFail($validated['role_id']);

        // Check if relationship already exists
        $exists = \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->where('activity_category_id', $validated['category_id'])
            ->exists();

        if (!$exists) {
            \DB::table('activity_category_role')->insert([
                'role_id' => $validated['role_id'],
                'activity_category_id' => $validated['category_id'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Get updated category IDs
        $categoryIds = \DB::table('activity_category_role')
            ->where('role_id', $validated['role_id'])
            ->pluck('activity_category_id')
            ->toArray();

        return response()->json([
            'message' => 'Category added successfully!',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'categories' => $categoryIds
            ]
        ]);
    }

    /**
     * Get current role-category mappings as JSON
     */
    public function getMappings(): JsonResponse
    {
        $roles = Role::orderBy('name')->get();

        // Get role-category assignments from pivot table
        $assignments = \DB::table('activity_category_role')
            ->select('role_id', 'activity_category_id')
            ->get()
            ->groupBy('role_id');

        $mappings = $roles->map(function ($role) use ($assignments) {
            $categoryIds = $assignments->has($role->id)
                ? $assignments[$role->id]->pluck('activity_category_id')->toArray()
                : [];

            return [
                'id' => $role->id,
                'name' => $role->name,
                'categories' => $categoryIds
            ];
        });

        return response()->json($mappings);
    }
}
