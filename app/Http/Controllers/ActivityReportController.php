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

/**
 * Activity Report Controller
 *
 * Permission Structure:
 * - All authenticated users can view their own activity reports (default access)
 * - Users with 'activity-list-all' permission can view all team members' reports
 *
 * Report Types:
 * 1. Activity Summary - Daily activity overview with charts and breakdowns
 * 2. Category Performance - Performance metrics by activity category
 * 3. User Activity Visualization - Detailed user activity with timeline and heatmaps
 *
 * Access Control:
 * - Own Reports: Always accessible to any authenticated user
 * - All Reports: Requires 'activity-list-all' permission
 */
class ActivityReportController extends Controller
{
    /**
     * Show the activity reports page with filters and aggregates
     * Users can see their own reports by default
     * Users with 'activity-list-all' can switch between 'my' and 'all' views
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

        // Defaults: if no date range provided, default to today's data for both 'my' and 'all'
        // This ensures consistent behavior when accessing reports page
        if (!$startDate && !$endDate) {
            $start = now()->startOfDay();
            $end = now()->endOfDay();
        } else {
            $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfDay();
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
                'average_duration' => $activities->count() > 0 ? round($totalMinutes / $activities->count(), 2) . ' min' : '0 min',
                // Average hours per person per day (numeric hours)
                'avg_per_person_per_day' => round($avgPerPersonPerDay, 2),
                // Human-friendly display for frontend (hours or minutes)
                'avg_per_person_per_day_display' => $avgDisplay,
                'avg_per_person_per_day_tooltip' => $avgTooltip,
                'total_users' => $uniqueUserCount,
                'total_duration' => round((float)$totalMinutes, 2) . ' min',
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

    // For exports, follow same defaulting behavior: if no dates provided, export today's data
    if (!$startDate && !$endDate) {
        $start = now()->startOfDay();
        $end = now()->endOfDay();
    } else {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfDay();
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfDay();
    }

        // Use ActivitySession instead of Activity to match web display
        $sessions = ActivitySession::query()
            ->whereBetween('started_at', [$start, $end])
            ->with(['activity.user.department', 'activity.activityCategory']);

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

        // Group by activity and sum session durations
        $sessionData = $sessions->get();
        $activitySums = $sessionData->groupBy('activity_id')->map(function($activitySessions) {
            $first = $activitySessions->first();
            $totalDuration = $activitySessions->sum('duration');

            return [
                'activity' => $first->activity,
                'total_duration' => round($totalDuration, 2),
            ];
        })->values();

        return Excel::download(
            new ActivitiesExport($activitySums, $start, $end),
            'activities_report_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

    /**
     * Basic permission check for activity reports
     * All authenticated users can view their own reports
     * Only users with 'activity-list-all' can view all team reports
     */
    protected function authorizeReports(): void
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized. Please login to view reports.');
        }
        // All authenticated users can view their own activity reports by default
        // No additional permission check needed for viewing own reports
    }

    /**
     * Show detailed category performance report
     * Shows performance metrics grouped by activity categories
     *
     * Access Control:
     * - Users without 'activity-list-all': Can only view their own category performance
     * - Users with 'activity-list-all': Can filter by any user or view all
     */
    public function categoryPerformance(Request $request)
    {
        $this->authorizeReports();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $userId = $request->input('user_id');
        $perPage = $request->input('per_page', 20); // Default 20 items per page
        $page = $request->input('page', 1);

        // Default to current month if no dates provided
        if (!$startDate && !$endDate) {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();
        } else {
            $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
            $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();
        }

        // Ensure end date is not before start date
        if ($end->lt($start)) {
            $end = $start->copy()->endOfDay();
        }

        // Apply permission-based filtering
        $currentUser = Auth::user();
        $canViewAll = $currentUser->can('activity-list-all');

        // Base query for activities
        $activitiesQuery = Activity::query()
            ->with(['activityCategory', 'user'])
            ->whereBetween('started_at', [$start, $end])
            ->where('status', 'completed'); // Only completed activities

        // Apply user filter
        if ($userId && $canViewAll) {
            $activitiesQuery->where('user_id', $userId);
        } elseif (!$canViewAll) {
            $activitiesQuery->where('user_id', $currentUser->id);
            $userId = $currentUser->id;
        }

        // Get all completed activities for the period
        $activities = $activitiesQuery->get();

        // Group by sub-category and calculate metrics
        $categoryStats = [];

        foreach ($activities as $activity) {
            $categoryId = $activity->activity_category_id;
            $category = $activity->activityCategory;

            if (!$category) continue;

            // Initialize category stats if not exists
            if (!isset($categoryStats[$categoryId])) {
                $categoryStats[$categoryId] = [
                    'sub_category_name' => $category->name,
                    'standard_time' => $category->standard_time ?? 0, // in minutes
                    'total_performed_time' => 0, // in minutes
                    'total_activity_count' => 0,
                    'user_ids' => [],
                ];
            }

            // Add activity data
            $categoryStats[$categoryId]['total_performed_time'] += $activity->duration ?? 0;
            $categoryStats[$categoryId]['total_activity_count'] += 1;

            // Track unique users
            if (!in_array($activity->user_id, $categoryStats[$categoryId]['user_ids'])) {
                $categoryStats[$categoryId]['user_ids'][] = $activity->user_id;
            }
        }

        // Calculate derived metrics and format data
        $allReportData = [];
        foreach ($categoryStats as $stats) {
            $totalUserCount = count($stats['user_ids']);
            $avgPerformedTime = $stats['total_activity_count'] > 0
                ? round($stats['total_performed_time'] / $stats['total_activity_count'], 2)
                : 0;

            // Determine limit/remark
            $standardTime = $stats['standard_time'];
            $remark = '';
            if ($standardTime > 0) {
                if ($avgPerformedTime > $standardTime) {
                    $remark = 'Above Standard';
                } elseif ($avgPerformedTime < $standardTime) {
                    $remark = 'Below Standard';
                } else {
                    $remark = 'Within Standard';
                }
            } else {
                $remark = 'No Standard Set';
            }

            $allReportData[] = [
                'sub_category' => $stats['sub_category_name'],
                'standard_time' => $standardTime,
                'total_performed_time' => round($stats['total_performed_time'], 2),
                'total_activity_count' => $stats['total_activity_count'],
                'total_user_count' => $totalUserCount,
                'average_performed_time' => $avgPerformedTime,
                'limit_remark' => $remark,
            ];
        }

        // Sort by sub-category name
        usort($allReportData, fn($a, $b) => strcmp($a['sub_category'], $b['sub_category']));

        // Apply pagination
        $totalItems = count($allReportData);
        $totalPages = ceil($totalItems / $perPage);
        $page = max(1, min($page, $totalPages ?: 1)); // Ensure page is within bounds

        $offset = ($page - 1) * $perPage;
        $reportData = array_slice($allReportData, $offset, $perPage);

        // Create pagination info
        $pagination = [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $totalItems,
            'last_page' => $totalPages ?: 1,
            'from' => $totalItems > 0 ? $offset + 1 : 0,
            'to' => min($offset + $perPage, $totalItems),
        ];

        // Get users list for filter
        $users = User::orderBy('name')->get(['id', 'name', 'employee_id']);

        return Inertia::render('Activities/CategoryPerformance', [
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'user_id' => $userId,
                'per_page' => $perPage,
            ],
            'users' => $users,
            'canViewAll' => $canViewAll,
            'reportData' => $reportData,
            'pagination' => $pagination,
            'summary' => [
                'total_categories' => $totalItems,
                'total_activities' => array_sum(array_column($allReportData, 'total_activity_count')),
                'total_time' => round(array_sum(array_column($allReportData, 'total_performed_time')), 2),
            ],
        ]);
    }

    /**
     * Export category performance report to Excel
     */
    public function exportCategoryPerformance(Request $request)
    {
        $this->authorizeReports();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $userId = $request->input('user_id');

        // Default to current month if no dates provided
        if (!$startDate && !$endDate) {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();
        } else {
            $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
            $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();
        }

        // Ensure end date is not before start date
        if ($end->lt($start)) {
            $end = $start->copy()->endOfDay();
        }

        // Apply permission-based filtering
        $currentUser = Auth::user();
        $canViewAll = $currentUser->can('activity-list-all');

        // Base query for activities
        $activitiesQuery = Activity::query()
            ->with(['activityCategory', 'user'])
            ->whereBetween('started_at', [$start, $end])
            ->where('status', 'completed');

        // Apply user filter
        if ($userId && $canViewAll) {
            $activitiesQuery->where('user_id', $userId);
        } elseif (!$canViewAll) {
            $activitiesQuery->where('user_id', $currentUser->id);
        }

        // Get all completed activities for the period
        $activities = $activitiesQuery->get();

        // Group by sub-category and calculate metrics
        $categoryStats = [];

        foreach ($activities as $activity) {
            $categoryId = $activity->activity_category_id;
            $category = $activity->activityCategory;

            if (!$category) continue;

            if (!isset($categoryStats[$categoryId])) {
                $categoryStats[$categoryId] = [
                    'sub_category_name' => $category->name,
                    'standard_time' => $category->standard_time ?? 0,
                    'total_performed_time' => 0,
                    'total_activity_count' => 0,
                    'user_ids' => [],
                ];
            }

            $categoryStats[$categoryId]['total_performed_time'] += $activity->duration ?? 0;
            $categoryStats[$categoryId]['total_activity_count'] += 1;

            if (!in_array($activity->user_id, $categoryStats[$categoryId]['user_ids'])) {
                $categoryStats[$categoryId]['user_ids'][] = $activity->user_id;
            }
        }

        // Calculate derived metrics
        $exportData = [];
        foreach ($categoryStats as $stats) {
            $totalUserCount = count($stats['user_ids']);
            $avgPerformedTime = $stats['total_activity_count'] > 0
                ? round($stats['total_performed_time'] / $stats['total_activity_count'], 2)
                : 0;

            $standardTime = $stats['standard_time'];
            $remark = '';
            if ($standardTime > 0) {
                if ($avgPerformedTime > $standardTime) {
                    $remark = 'Above Standard';
                } elseif ($avgPerformedTime < $standardTime) {
                    $remark = 'Below Standard';
                } else {
                    $remark = 'Within Standard';
                }
            } else {
                $remark = 'No Standard Set';
            }

            $exportData[] = [
                'Sub-Category' => $stats['sub_category_name'],
                'Standard Time (min)' => $standardTime,
                'Total Performed Time (min)' => round($stats['total_performed_time'], 2),
                'Total Activity Count' => $stats['total_activity_count'],
                'Total User Count' => $totalUserCount,
                'Average Performed Time (min)' => $avgPerformedTime,
                'Limit/Remark' => $remark,
            ];
        }

        // Sort by sub-category name
        usort($exportData, fn($a, $b) => strcmp($a['Sub-Category'], $b['Sub-Category']));

        return Excel::download(
            new \App\Exports\CategoryPerformanceExport($exportData, $start, $end, $userId),
            'category_performance_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

        /**
     * Show user activity visualization report
     * Displays detailed activity visualization with charts, heatmaps, and timelines
     *
     * Access Control:
     * - Users without 'activity-list-all': Can only view their own activity visualization
     * - Users with 'activity-list-all': Can select any user to view
     * - Defaults to current user if no user selected
     */
    public function userActivityVisualization(Request $request)
    {
        $this->authorizeReports();

        $currentUser = Auth::user();
        $canViewAll = $currentUser->can('activity-list-all');

        // Get user filter - if can't view all, force to current user
        $userId = $request->input('user_id');
        if (!$canViewAll) {
            $userId = $currentUser->id;
        }

        // If no user selected and can view all, default to current user
        if (!$userId) {
            $userId = $currentUser->id;
        }

        // Date range - default to last 30 days
        $endDate = $request->input('end_date') ? \Carbon\Carbon::parse($request->input('end_date')) : now();
        $startDate = $request->input('start_date')
            ? \Carbon\Carbon::parse($request->input('start_date'))
            : $endDate->copy()->subDays(29);

        $viewType = $request->input('view_type', 'daily');

        // Get user info
        $selectedUser = User::find($userId);
        $selectedUserName = $selectedUser ? ($selectedUser->employee_id
            ? "{$selectedUser->name} ({$selectedUser->employee_id})"
            : $selectedUser->name) : null;

        // Query activity sessions for the user
        $sessions = ActivitySession::whereHas('activity', function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->whereBetween('started_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->with(['activity.activityCategory.parent'])
            ->get();

        // Prepare daily data
        $dailyData = [];
        $categoryBreakdown = [];
        $dateRange = new \DatePeriod(
            $startDate->copy()->startOfDay(),
            new \DateInterval('P1D'),
            $endDate->copy()->addDay()->startOfDay()
        );

        foreach ($dateRange as $date) {
            $dateKey = $date->format('Y-m-d');
            $daySessions = $sessions->filter(function($session) use ($date) {
                return \Carbon\Carbon::parse($session->started_at)->isSameDay($date);
            });

            $totalMinutes = $daySessions->sum('duration');

            // Only add to dailyData if there's activity on this day
            if ($totalMinutes > 0) {
                $dailyData[] = [
                    'date' => $date->format('M d'),
                    'total_minutes' => round($totalMinutes, 2),
                ];

                // Category breakdown - Use parent category (main category)
                $categoryData = ['date' => $date->format('M d')];
                $categoriesInDay = $daySessions->groupBy(function($session) {
                    $category = $session->activity->activityCategory;
                    // If it has a parent, use parent name (main category), otherwise use its own name
                    if ($category && $category->parent_id && $category->parent) {
                        return $category->parent->name;
                    }
                    return $category ? $category->name : 'Uncategorized';
                });

                foreach ($categoriesInDay as $categoryName => $categorySessions) {
                    $categoryData[$categoryName] = round($categorySessions->sum('duration'), 2);
                }

                $categoryBreakdown[] = $categoryData;
            }
        }        // Prepare hourly heatmap (day of week vs hour of day)
        $hourlyHeatmap = [];
        for ($day = 0; $day < 7; $day++) {
            $hourlyHeatmap[$day] = array_fill(0, 24, 0);
        }

        foreach ($sessions as $session) {
            $startTime = \Carbon\Carbon::parse($session->started_at);
            $dayOfWeek = $startTime->dayOfWeek; // 0 = Sunday, 6 = Saturday
            $hour = $startTime->hour;

            $hourlyHeatmap[$dayOfWeek][$hour] += $session->duration ?? 0;
        }

        // Calculate summary statistics
        $totalMinutes = $sessions->sum('duration');
        $totalActivities = $sessions->pluck('activity_id')->unique()->count();
        $activeDays = $sessions->pluck('started_at')
            ->map(function($date) {
                return \Carbon\Carbon::parse($date)->format('Y-m-d');
            })
            ->unique()
            ->count();

        $avgPerDay = $activeDays > 0 ? $totalMinutes / $activeDays : 0;

        $summary = [
            'total_minutes' => round($totalMinutes, 2),
            'total_activities' => $totalActivities,
            'active_days' => $activeDays,
            'avg_per_day' => round($avgPerDay, 2),
        ];

        // Prepare detailed session timeline
        $sessionTimeline = [];
        $sortedSessions = $sessions->sortBy('started_at')->values();

        foreach ($sortedSessions as $index => $session) {
            $startTime = \Carbon\Carbon::parse($session->started_at);
            $endTime = $session->ended_at ? \Carbon\Carbon::parse($session->ended_at) : null;

            $category = $session->activity->activityCategory;
            $mainCategory = ($category && $category->parent_id && $category->parent)
                ? $category->parent->name
                : ($category ? $category->name : 'Uncategorized');
            $subCategory = ($category && $category->parent_id) ? $category->name : null;

            $duration = $session->duration ?? 0;
            $hours = floor($duration / 60);
            $minutes = $duration % 60;
            $durationFormatted = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";

            // Calculate idle time to next session
            $idleAfter = null;
            $nextSessionStart = null;
            if ($index < $sortedSessions->count() - 1) {
                $nextSession = $sortedSessions[$index + 1];
                $nextStart = \Carbon\Carbon::parse($nextSession->started_at);

                // Only calculate idle if sessions are on the same day
                if ($endTime && $startTime->isSameDay($nextStart)) {
                    $idleMinutes = $endTime->diffInMinutes($nextStart);
                    if ($idleMinutes > 0) {
                        $idleHours = floor($idleMinutes / 60);
                        $idleMins = $idleMinutes % 60;
                        $idleAfter = $idleHours > 0 ? "{$idleHours}h {$idleMins}m" : "{$idleMins}m";
                        $nextSessionStart = $nextStart->format('h:i A');
                    }
                }
            }

            $sessionTimeline[] = [
                'date' => $startTime->format('l, F j, Y'), // e.g., "Monday, November 5, 2025"
                'start_time' => $startTime->format('h:i A'), // e.g., "08:34 AM"
                'end_time' => $endTime ? $endTime->format('h:i A') : 'Ongoing',
                'category' => $mainCategory,
                'sub_category' => $subCategory,
                'description' => $session->activity->description ?? '',
                'duration' => $durationFormatted,
                'status' => $session->activity->status ?? 'unknown',
                'idle_after' => $idleAfter,
                'next_session_start' => $nextSessionStart,
            ];
        }

        // Get users list for filter dropdown
        $users = User::orderBy('name')->get(['id', 'name', 'employee_id']);

        return Inertia::render('Activities/UserActivityVisualization', [
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'user_id' => $userId,
                'view_type' => $viewType,
            ],
            'users' => $users,
            'canViewAll' => $canViewAll,
            'dailyData' => $dailyData,
            'categoryBreakdown' => $categoryBreakdown,
            'hourlyHeatmap' => $hourlyHeatmap,
            'summary' => $summary,
            'selectedUserName' => $selectedUserName,
            'sessionTimeline' => $sessionTimeline,
        ]);
    }
}
