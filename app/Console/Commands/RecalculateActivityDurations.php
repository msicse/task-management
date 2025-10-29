<?php

namespace App\Console\Commands;

use App\Models\Activity;
use Illuminate\Console\Command;

class RecalculateActivityDurations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activities:recalculate-durations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate durations for all activities based on their sessions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Recalculating activity durations...');

        $activities = Activity::with('sessions')->get();
        $count = 0;

        foreach ($activities as $activity) {
            $oldDuration = $activity->duration;

            // Recalculate all session durations
            $activity->recalculateAllDurations();

            $newDuration = $activity->fresh()->duration;

            if ($oldDuration !== $newDuration) {
                $this->line("Activity #{$activity->id}: {$oldDuration} -> {$newDuration} minutes");
                $count++;
            }
        }

        $this->info("Recalculated durations for {$count} activities.");
        return 0;
    }
}
