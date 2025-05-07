<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\Auth;

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
            "myCreatedTasks"
        ));
    }
}
