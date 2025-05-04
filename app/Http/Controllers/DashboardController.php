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

        $totalPendingTasks = Task::query()->where("status", "pending")->count();
        $myPendingTasks = Task::query()->where("status", "pending")->where("assigned_user_id", $user->id)->count();

        $totalProgressTasks = Task::query()->where("status", "in_progress")->count();
        $myProgressTasks = Task::query()->where("status", "in_progress")->where("assigned_user_id", $user->id)->count();

        $totalCompletedTasks = Task::query()->where("status", "completed")->count();
        $myCompletedTasks = Task::query()->where("status", "completed")->where("assigned_user_id", $user->id)->count();

        $myTasks = Task::query()->where("status", ["pending", "in_progress"])->where("assigned_user_id", $user->id)->limit(10)->get();

        $activeTasks = TaskResource::collection($myTasks);

        return inertia("Dashboard", compact("totalPendingTasks", "myPendingTasks", "totalCompletedTasks", "myCompletedTasks", "totalProgressTasks", "myProgressTasks", "activeTasks"));
    }
}
