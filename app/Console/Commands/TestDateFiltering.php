<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Models\ActivitySession;
use Carbon\Carbon;

class TestDateFiltering extends Command
{
    protected $signature = 'test:date-filtering {start_date?} {end_date?}';
    protected $description = 'Test date filtering logic for activities and sessions';

    public function handle()
    {
        $startDate = $this->argument('start_date') ?: '2025-10-01';
        $endDate = $this->argument('end_date') ?: '2025-10-07';

        $this->info("Testing date filtering from {$startDate} to {$endDate}");

        // Parse dates like the controller does
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $this->info("Parsed start: {$start}");
        $this->info("Parsed end: {$end}");

        // Check activities
        $activities = Activity::whereBetween('started_at', [$start, $end])->get();
        $this->info("Activities in range: " . $activities->count());

        if ($activities->count() > 0) {
            $this->info("Sample activities:");
            foreach ($activities->take(5) as $activity) {
                $this->line("- {$activity->title} (Started: {$activity->started_at})");
            }
        }

        // Check sessions
        $sessions = ActivitySession::whereBetween('started_at', [$start, $end])->get();
        $this->info("Sessions in range: " . $sessions->count());

        if ($sessions->count() > 0) {
            $this->info("Sample sessions:");
            foreach ($sessions->take(5) as $session) {
                $this->line("- Activity ID: {$session->activity_id} (Started: {$session->started_at})");
            }
        }

        // Check overall date ranges in database
        $minActivityDate = Activity::min('started_at');
        $maxActivityDate = Activity::max('started_at');
        $minSessionDate = ActivitySession::min('started_at');
        $maxSessionDate = ActivitySession::max('started_at');

        $this->info("\nDatabase Date Ranges:");
        $this->line("Activities: {$minActivityDate} to {$maxActivityDate}");
        $this->line("Sessions: {$minSessionDate} to {$maxSessionDate}");
    }
}
