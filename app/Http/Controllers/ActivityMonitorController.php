<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityMonitorController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user has permission to view all activities
        if (!$user->can('activity-list-all')) {
            abort(403, 'Unauthorized to view team activities.');
        }

        // Get activity categories applicable to current user's roles
        $activityCategories = $user->getApplicableActivityCategories();
        $applicableCategoryIds = $activityCategories->pluck('id')->toArray();

        // Build query for all active activities
        $query = Activity::with(['user.department', 'activityCategory', 'files', 'sessions'])
            ->whereIn('status', ['started', 'paused']);

        // Filter by applicable categories if they exist
        if (!empty($applicableCategoryIds)) {
            $query->whereIn('activity_category_id', $applicableCategoryIds);
        }

        // Filter by user if requested
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by category if requested
        if ($request->filled('category_id')) {
            $query->where('activity_category_id', $request->category_id);
        }

        // Filter by status if requested
        if ($request->filled('status') && in_array($request->status, ['started', 'paused'])) {
            $query->where('status', $request->status);
        }

        // Filter by department if requested
        if ($request->filled('department_id')) {
            $query->whereHas('user', function ($userQuery) use ($request) {
                $userQuery->where('department_id', $request->department_id);
            });
        }

        // Sort by updated_at desc by default
        $sortField = $request->get('sort_field', 'updated_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $validSortFields = ['updated_at', 'created_at', 'user_id', 'activity_category_id'];
        if (in_array($sortField, $validSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('updated_at', 'desc');
        }

        $activities = $query->paginate(15)->onEachSide(1);

        // Calculate real-time duration for each activity
        $activities->getCollection()->transform(function ($activity) {
            $activity->real_time_duration = $activity->getTotalDurationFromSessions();
            return $activity;
        });

        // Get all users who have activities for filtering
        $users = \App\Models\User::whereHas('activities', function ($query) use ($applicableCategoryIds) {
                if (!empty($applicableCategoryIds)) {
                    $query->whereIn('activity_category_id', $applicableCategoryIds);
                }
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get all departments for filtering
        $departments = Department::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('ActivityMonitor/Index', [
            'activities' => $activities,
            'activityCategories' => $activityCategories,
            'users' => $users,
            'departments' => $departments,
            'queryParams' => $request->only(['user_id', 'category_id', 'status', 'department_id', 'sort_field', 'sort_direction']),
            'success' => session('success'),
        ]);
    }
}
