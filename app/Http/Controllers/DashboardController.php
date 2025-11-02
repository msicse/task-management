<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Tasks assigned to the current user
        $totalPendingTasks = Task::query()->where("status", "pending")->count();
        $myPendingTasks = Task::query()->where("status", "pending")->where("assigned_user_id", $user->id)->count();

        $totalProgressTasks = Task::query()->where("status", "in_progress")->count();
        $myProgressTasks = Task::query()->where("status", "in_progress")->where("assigned_user_id", $user->id)->count();

        $totalCompletedTasks = Task::query()->where("status", "completed")->count();
        $myCompletedTasks = Task::query()->where("status", "completed")->where("assigned_user_id", $user->id)->count();

        // Tasks created by the current user
        $createdPendingTasks = Task::query()->where("status", "pending")->where("created_by", $user->id)->count();
        $createdProgressTasks = Task::query()->where("status", "in_progress")->where("created_by", $user->id)->count();
        $createdCompletedTasks = Task::query()->where("status", "completed")->where("created_by", $user->id)->count();

        // Recent tasks assigned to the user
        $myTasks = Task::query()
            ->whereIn("status", ["pending", "in_progress"])
            ->where("assigned_user_id", $user->id)
            ->with(['createdBy', 'category'])
            ->latest()
            ->limit(5)
            ->get();

        // Recent tasks created by the user
        $createdTasks = Task::query()
            ->whereIn("status", ["pending", "in_progress"])
            ->where("created_by", $user->id)
            ->with(['assignedUser', 'category'])
            ->latest()
            ->limit(5)
            ->get();

        $activeTasks = TaskResource::collection($myTasks);
        $myCreatedTasks = TaskResource::collection($createdTasks);

        // Get activity categories applicable to current user's roles
        $activityCategories = $user->getApplicableActivityCategories();

        // Get applicable category IDs for filtering activities
        $applicableCategoryIds = $activityCategories->pluck('id')->toArray();

        // Get user's active activities (started or paused) from applicable categories only
        $activeActivities = Activity::with(['activityCategory', 'files', 'sessions'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['started', 'paused'])
            ->when(!empty($applicableCategoryIds), function($query) use ($applicableCategoryIds) {
                return $query->whereIn('activity_category_id', $applicableCategoryIds);
            })
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function (Activity $activity) {
                if (! $activity->relationLoaded('sessions')) {
                    $activity->load('sessions');
                }

                $activity->real_time_duration = (float) $activity->getTotalDurationFromSessions();
                return $activity;
            });

        // Get user's work roles for display
        $userWorkRoles = $user->workRoles;

        // Get all main categories for Dashboard select
        $allMainCategories = ActivityCategory::whereNull('parent_id')->orderBy('name')->get(['id', 'name']);
        // Get all categories for grouped select
        $allCategories = ActivityCategory::orderBy('name')->get(['id', 'name', 'parent_id']);

        // Compute top categories used by the current user (by activity count)
        $topCategories = Activity::join('activity_categories', 'activities.activity_category_id', '=', 'activity_categories.id')
            ->where('activities.user_id', $user->id)
            ->groupBy('activity_categories.id', 'activity_categories.name')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(10)
            ->get([
                'activity_categories.id as id',
                'activity_categories.name as name',
                DB::raw('COUNT(*) as usage_count'),
            ]);

        return inertia("Dashboard", compact(
            "totalPendingTasks",
            "myPendingTasks",
            "totalCompletedTasks",
            "myCompletedTasks",
            "totalProgressTasks",
            "myProgressTasks",
            "activeTasks",
            "createdPendingTasks",
            "createdProgressTasks",
            "createdCompletedTasks",
            "myCreatedTasks",
            "activityCategories",
            "activeActivities",
            "userWorkRoles",
            "allMainCategories",
            "allCategories",
            "topCategories"
        ));
    }
}
