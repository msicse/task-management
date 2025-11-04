<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    /**
     * Determine whether the user can view the activity.
     */
    public function view(User $user, Activity $activity): bool
    {
        // Admins (or global-admin via Gate::before) can view any; others only their own
        return $user->hasRole('Admin') || $activity->user_id === $user->id;
    }

    /**
     * Determine whether the user can create activities.
     */
    public function create(User $user): bool
    {
        return $user->can('activity-create');
    }

    /**
     * Determine whether the user can create manual activities.
     */
    public function createManual(User $user): bool
    {
        return $user->can('activity-create-manual');
    }

    /**
     * Determine whether the user can update the activity.
     */
    public function update(User $user, Activity $activity): bool
    {
        return $user->hasRole('Admin') || $activity->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the activity.
     */
    public function delete(User $user, Activity $activity): bool
    {
        return $user->hasRole('Admin') || $activity->user_id === $user->id;
    }

    /**
     * Determine whether the user can start/pause/complete the activity.
     */
    public function operate(User $user, Activity $activity): bool
    {
        return $user->hasRole('Admin') || $activity->user_id === $user->id;
    }

    /**
     * Files management (view/upload/delete) - reuse same rule as update
     */
    public function manageFiles(User $user, Activity $activity): bool
    {
        return $this->update($user, $activity);
    }
}
