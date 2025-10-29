<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\UserPermissionService;

class CheckCategoryAssignment
{
    protected $permissionService;

    public function __construct(UserPermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request to check if user is assigned to category
     */
    public function handle(Request $request, Closure $next, $categoryId = null)
    {
        $user = auth()->user();

        if (!$user) {
            abort(401, 'Unauthorized');
        }

        // If specific category is required
        if ($categoryId) {
            if (!$this->permissionService->isAssignedToCategory($user, $categoryId)) {
                abort(403, 'You are not assigned to work on this category');
            }
        }

        // Add user's assignments to request for easy access
        $request->merge([
            'user_assigned_categories' => $this->permissionService->getAssignedCategories($user)
        ]);

        return $next($request);
    }
}
