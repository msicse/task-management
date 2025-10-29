<?php

namespace App\Http\Controllers;

use App\Exports\ActivitiesExport;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivitySession;
use App\Models\User;
use App\Models\Department;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;

class ActivityReportController extends Controller
{
    /**
     * Show the activity reports page with filters and aggregates
     */
    public function index(Request $request)
    {
        $this->authorizeReports();

        $filter = $request->input('filter', 'my'); // Default to 'my' activities
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $userId = $request->input('user_id');
        $categoryId = $request->input('category_id');
        $departmentId = $request->input('department_id');
        $roleId = $request->input('role_id');

        // Defaults: last 30 days, but if user explicitly requested 'all' filter with no date range,
        // default to today's data (so /activities/reports?filter=all shows today's data by default)
        if (!$startDate && !$endDate && $filter === 'all') {
            $start = now()->startOfDay();
            $end = now()->endOfDay();
        } else {
            $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->subDays(29)->startOfDay();
            $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfDay();
        }

        // Ensure end date is not before start date
        if ($end->lt($start)) {
            $end = $start->copy()->endOfDay();
        }

        // Apply permission-based filtering
        $currentUser = Auth::user();

        // If filter is 'my' or user doesn't have 'activity-list-all' permission, limit to own activities
        if ($filter === 'my' || !$currentUser->can('activity-list-all')) {
            $userId = $currentUser->id;
        }

        // Base sessions query within date range
        $sessions = ActivitySession::query()
            ->with(['activity.user', 'activity.activityCategory'])
            ->whereBetween('started_at', [$start, $end]);

        if ($userId) {
            $sessions->whereHas('activity', fn($q) => $q->where('user_id', $userId));
        }
        if ($departmentId) {
            $sessions->whereHas('activity.user', fn($q) => $q->where('department_id', $departmentId));
        }
        if ($categoryId) {
            $sessions->whereHas('activity', fn($q) => $q->where('activity_category_id', $categoryId));
        }
        if ($roleId) {
            $sessions->whereHas('activity.user.roles', fn($q) => $q->where('roles.id', $roleId));
        }

        // Daily aggregates
        $daily = (clone $sessions)
            ->selectRaw('DATE(started_at) as day')
            ->selectRaw('COUNT(DISTINCT activity_id) as activities_count')
            ->selectRaw('COALESCE(SUM(duration), 0) as minutes_sum')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $totalDays = $daily->count();
    $totalMinutes = (clone $sessions)->sum('duration') ?? 0.0;
    $totalHours = round((float)$totalMinutes / 60.0, 2);



        // Distribution by status using activities filtered by started_at range
        $activities = Activity::query()
            ->whereBetween('started_at', [$start, $end]);
        if ($userId) {
            $activities->where('user_id', $userId);
        }
        if ($departmentId) {
            $activities->whereHas('user', fn($q) => $q->where('department_id', $departmentId));
        }
        if ($categoryId) {
            $activities->where('activity_category_id', $categoryId);
        }
        if ($roleId) {
            $activities->whereHas('user.roles', fn($q) => $q->where('roles.id', $roleId));
        }

        // Unique users in the filtered activities range - used for per person averages
        $uniqueUserCount = (clone $activities)->distinct('user_id')->count('user_id') ?: 0;
        // Compute average hours per person per day: totalHours / (totalDays * uniqueUserCount)
        if ($totalDays > 0 && $uniqueUserCount > 0) {
            $avgPerPersonPerDay = $totalHours / ($totalDays * $uniqueUserCount);
        } else {
            $avgPerPersonPerDay = 0;
        }

        // Prepare a human-friendly display string: if >= 1 hour show hours with 1 decimal, else show minutes
        if ($avgPerPersonPerDay >= 1) {
            $avgDisplay = round($avgPerPersonPerDay, 1) . ' hours';
        } else {
            $avgMinutes = (int) round($avgPerPersonPerDay * 60);
            $avgDisplay = $avgMinutes . ' m';
        }

        $avgTooltip = 'Calculated as total hours / (days × distinct users)';

        $statusBreakdown = (clone $activities)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Category breakdown: count per category id, then map names
        $categoryCounts = (clone $activities)
            ->select('activity_category_id', DB::raw('COUNT(*) as count'))
            ->groupBy('activity_category_id')
            ->pluck('count', 'activity_category_id');

        $categoryIds = $categoryCounts->keys()->filter(fn($id) => !is_null($id))->values();
        $categoryNames = ActivityCategory::whereIn('id', $categoryIds)->pluck('name', 'id');

        $categoryBreakdown = [];
        foreach ($categoryCounts as $catId => $count) {
            $name = is_null($catId) ? 'Uncategorized' : ($categoryNames[$catId] ?? 'Unknown');
            $categoryBreakdown[$name] = $count;
        }

        // Sort by count (descending) and take top 5
        arsort($categoryBreakdown);
        $categoryBreakdown = array_slice($categoryBreakdown, 0, 5, true);

        // Department breakdown by activities count
        $departmentCounts = (clone $activities)
            ->join('users', 'users.id', '=', 'activities.user_id')
            ->select('users.department_id', DB::raw('COUNT(activities.id) as count'))
            ->groupBy('users.department_id')
            ->pluck('count', 'users.department_id');

        $deptIds = $departmentCounts->keys()->filter(fn($id) => !is_null($id))->values();
        $deptNames = Department::whereIn('id', $deptIds)->pluck('name', 'id');
        $departmentBreakdown = [];
        foreach ($departmentCounts as $deptId => $count) {
            $name = is_null($deptId) ? 'No Department' : ($deptNames[$deptId] ?? 'Unknown');
            $departmentBreakdown[$name] = $count;
        }

        // Simple chart data for daily minutes
        $chart = [
            'labels' => $daily->pluck('day')->map(fn($d) => (string)$d)->values(),
            'series' => [
                // Keep minutes as floats (rounded) so sub-minute precision is preserved in charts
                'minutes' => $daily->pluck('minutes_sum')->map(fn($m) => round((float)$m, 2))->values(),
                'activities' => $daily->pluck('activities_count')->map(fn($c) => (int)$c)->values(),
            ],
        ];

        // Per-day simple table rows
        $perDayRows = $daily->map(function ($row) {
            $minutesSum = (float)($row->minutes_sum ?? 0.0);
            $hours = round($minutesSum / 60.0, 2);
            return [
                'day' => (string)$row->day,
                'activities_count' => (int)$row->activities_count,
                'hours' => $hours,
                // Preserve fractional minutes (rounded to 2 decimals) for frontend formatting
                'minutes' => round($minutesSum, 2),
            ];
        });

        // Pagination for detailed activities view
        $perPage = $request->input('per_page', 20); // Default 20 items per page
        $page = $request->input('page', 1);

        // Every task per day (sum of minutes per activity per date) - with pagination
        $perDayActivitySums = (clone $sessions)
            ->selectRaw('DATE(started_at) as day, activity_id, COALESCE(SUM(duration),0) as minutes_sum')
            ->groupBy('day', 'activity_id')
            ->orderBy('day', 'desc')
            ->orderBy('activity_id', 'desc');

        // Get total count for pagination
        $totalItems = $perDayActivitySums->get()->count();

        // Apply pagination
        $paginatedSums = $perDayActivitySums
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $activityIds = $paginatedSums->pluck('activity_id')->unique()->values();
        $activityMap = Activity::with(['user:id,name', 'activityCategory:id,name,standard_time'])
            ->whereIn('id', $activityIds)
            ->get()
            ->keyBy('id');

        $perDayActivities = [];
        foreach ($paginatedSums as $row) {
            $act = $activityMap[$row->activity_id] ?? null;
            $dayKey = (string)$row->day;
            $perDayActivities[$dayKey] = $perDayActivities[$dayKey] ?? [];
            $minutesSum = (float)($row->minutes_sum ?? 0.0);
            $perDayActivities[$dayKey][] = [
                'activity_id' => (int)$row->activity_id,
                'description' => $act?->description,
                'user' => $act?->user?->name,
                'category' => $act?->activityCategory?->name,
                'category_standard_time' => $act?->activityCategory?->standard_time,
                'status' => $act?->status,
                'count' => $act?->count ?? 0,
                // Preserve fractional minutes (rounded) instead of casting to int
                'minutes' => round($minutesSum, 2),
                'hours' => round($minutesSum / 60.0, 2),
            ];
        }

        // Create pagination info
        $pagination = [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $totalItems,
            'last_page' => ceil($totalItems / $perPage),
            'from' => (($page - 1) * $perPage) + 1,
            'to' => min($page * $perPage, $totalItems),
        ];

    $users = User::orderBy('name')->get(['id','name']);
    $categories = ActivityCategory::orderBy('name')->get(['id','name']);
    $departments = Department::orderBy('name')->get(['id','name']);
    $roles = Role::orderBy('name')->get(['id','name']);

        return Inertia::render('Activities/Reports', [
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'user_id' => $userId,
                'category_id' => $categoryId,
                'department_id' => $departmentId,
                'role_id' => $roleId,
                'filter' => $filter,
            ],
            'users' => $users,
            'categories' => $categories,
            'departments' => $departments,
            'roles' => $roles,
            'summary' => [
                'total_days' => $totalDays,
                'total_hours' => $totalHours,
                'total_minutes' => round((float)$totalMinutes, 2),
                'total_activities' => $activities->count(),
                'average_duration' => $activities->count() > 0 ? round($totalMinutes / $activities->count(), 2) . ' minutes' : '0 minutes',
                // Average hours per person per day (numeric hours)
                'avg_per_person_per_day' => round($avgPerPersonPerDay, 2),
                // Human-friendly display for frontend (hours or minutes)
                'avg_per_person_per_day_display' => $avgDisplay,
                'avg_per_person_per_day_tooltip' => $avgTooltip,
                'total_users' => $uniqueUserCount,
                'total_duration' => $totalHours . ' hours',
                'status_breakdown' => $statusBreakdown,
                'category_breakdown' => $categoryBreakdown,
                'department_breakdown' => $departmentBreakdown,
            ],
            'perDay' => $perDayRows,
            'perDayActivities' => $perDayActivities,
            'pagination' => $pagination,
            'chart' => $chart,
            'success' => session('success'),
        ]);
    }

    /**
     * Export activities to Excel based on filters
     */
    public function exportExcel(Request $request)
    {
        $this->authorizeReports();

        $filter = $request->input('filter', 'my'); // Default to 'my' activities
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $userId = $request->input('user_id');
        $categoryId = $request->input('category_id');
        $departmentId = $request->input('department_id');
        $roleId = $request->input('role_id');

        // Apply permission-based filtering for export
        $currentUser = Auth::user();
        if ($filter === 'my' || !$currentUser->can('activity-list-all')) {
            $userId = $currentUser->id;
        }

    // For exports, follow same defaulting behavior: if filter=all and no dates provided, export today's data
    if (!$startDate && !$endDate && $filter === 'all') {
        $start = now()->startOfDay();
        $end = now()->endOfDay();
    } else {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->subDays(29)->startOfDay();
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfDay();
    }

        $query = Activity::with(['user','activityCategory:id,name,standard_time'])
            ->whereBetween('started_at', [$start, $end]);

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($departmentId) {
            $query->whereHas('user', fn($q) => $q->where('department_id', $departmentId));
        }
        if ($categoryId) {
            $query->where('activity_category_id', $categoryId);
        }
        if ($roleId) {
            $query->whereHas('user.roles', fn($q) => $q->where('roles.id', $roleId));
        }

        $activities = $query->get();

        return Excel::download(
            new ActivitiesExport($activities, $start, $end),
            'activities_report_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

    /**
     * Basic permission check for activity reports
     */
    protected function authorizeReports(): void
    {
        $user = Auth::user();
        if (!$user) {
            abort(403);
        }
        // Allow users with activity permissions or task permissions (backward compatibility)
        if (!($user->can('activity-list') || $user->can('activity-list-all') || $user->can('task-list'))) {
            abort(403, 'Unauthorized action.');
        }
    }
}
