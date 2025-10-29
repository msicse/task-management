<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\WorkRole;
use App\Models\ActivityCategory;
use Illuminate\Support\Collection;

class UserPermissionService
{
    /**
     * SITE PERMISSIONS - What user CAN do
     */

    public function hasPermission(User $user, string $permission): bool
    {
        return $user->can($permission);
    }

    public function hasRole(User $user, string $role): bool
    {
        return $user->hasRole($role);
    }

    /**
     * WORK ASSIGNMENTS - What user IS assigned to work on
     */

    public function isAssignedToCategory(User $user, int $categoryId): bool
    {
        return $user->workRoles()
            ->whereHas('activityCategories', function($query) use ($categoryId) {
                $query->where('activity_category_id', $categoryId);
            })
            ->exists();
    }

    public function getAssignedCategories(User $user): Collection
    {
        return $user->getWorkRoleCategories();
    }

    public function getWorkRoles(User $user): Collection
    {
        return $user->workRoles()->get();
    }

    /**
     * WORK ROLE MANAGEMENT
     */

    public function assignUserToWorkRole(User $user, WorkRole $workRole): bool
    {
        if (!$user->workRoles()->where('work_role_id', $workRole->id)->exists()) {
            $user->workRoles()->attach($workRole->id);
            return true;
        }
        return false;
    }

    public function removeUserFromWorkRole(User $user, WorkRole $workRole): bool
    {
        return $user->workRoles()->detach($workRole->id) > 0;
    }

    public function assignWorkRoleToCategory(WorkRole $workRole, ActivityCategory $category): bool
    {
        if (!$workRole->activityCategories()->where('activity_category_id', $category->id)->exists()) {
            $workRole->activityCategories()->attach($category->id);
            return true;
        }
        return false;
    }

    public function removeWorkRoleFromCategory(WorkRole $workRole, ActivityCategory $category): bool
    {
        return $workRole->activityCategories()->detach($category->id) > 0;
    }

    /**
     * Check user's complete access level for activities
     */
    public function getUserActivityAccess(User $user): array
    {
        return [
            // Site permissions (what they CAN do)
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'site_roles' => $user->getRoleNames(),

            // Work assignments (what they ARE assigned to)
            'work_roles' => $this->getWorkRoles($user)->pluck('name'),
            'assigned_categories' => $this->getAssignedCategories($user),
            'can_view_all_activities' => $this->hasPermission($user, 'view-all-activities'),
            'can_manage_activities' => $this->hasPermission($user, 'manage-activities'),
        ];
    }
}
