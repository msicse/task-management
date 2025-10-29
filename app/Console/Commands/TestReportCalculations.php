<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Models\ActivitySession;
use App\Models\ActivityCategory;
use App\Models\Department;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TestReportCalculations extends Command
{
    protected $signature = 'test:report-calculations {start_date?} {end_date?}';
    protected $description = 'Test report calculations like the controller';

    public function handle()
    {
        $startDate = $this->argument('start_date') ?: null;
        $endDate = $this->argument('end_date') ?: null;

        // Same logic as controller
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : now()->subDays(29)->startOfDay();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : now()->endOfDay();

        $this->info("Testing calculations from {$start} to {$end}");

        // Base sessions query within date range
        $sessions = ActivitySession::query()
            ->with(['activity.user', 'activity.activityCategory'])
            ->whereBetween('started_at', [$start, $end]);

        // Daily aggregates
        $daily = (clone $sessions)
            ->selectRaw('DATE(started_at) as day')
            ->selectRaw('COUNT(DISTINCT activity_id) as activities_count')
            ->selectRaw('COALESCE(SUM(duration), 0) as minutes_sum')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $totalDays = $daily->count();
        $totalMinutes = (clone $sessions)->sum('duration') ?? 0;
        $totalHours = round($totalMinutes / 60, 2);

        // Activities query with same date filter
        $activities = Activity::query()
            ->whereBetween('started_at', [$start, $end]);

        $totalActivities = $activities->count();
        $averageDuration = $totalActivities > 0 ? round($totalMinutes / $totalActivities, 2) : 0;

        $this->info("Results:");
        $this->line("Total Days: {$totalDays}");
        $this->line("Total Minutes: {$totalMinutes}");
        $this->line("Total Hours: {$totalHours}");
        $this->line("Total Activities: {$totalActivities}");
        $this->line("Average Duration: {$averageDuration} minutes");

        // Check some sample data
        $this->info("\nDaily breakdown (first 5 days):");
        foreach ($daily->take(5) as $day) {
            $this->line("Date: {$day->day}, Activities: {$day->activities_count}, Minutes: {$day->minutes_sum}");
        }

        // Status breakdown
        $statusBreakdown = (clone $activities)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $this->info("\nStatus Breakdown:");
        foreach ($statusBreakdown as $status => $count) {
            $this->line("Status: {$status}, Count: {$count}");
        }
    }
}
