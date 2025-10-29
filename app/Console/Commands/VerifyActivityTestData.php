<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Models\ActivitySession;
use App\Models\User;
use App\Models\ActivityCategory;
use Carbon\Carbon;

class VerifyActivityTestData extends Command
{
    protected $signature = 'activity:verify-test-data';
    protected $description = 'Verify the generated activity test data';

    public function handle()
    {
        $this->info('🔍 Verifying Activity Test Data...');
        $this->newLine();

        // Basic counts
        $activityCount = Activity::count();
        $sessionCount = ActivitySession::count();
        $userCount = User::count();
        $categoryCount = ActivityCategory::count();

        $this->info("📊 Database Overview:");
        $this->info("- Activities: {$activityCount}");
        $this->info("- Activity Sessions: {$sessionCount}");
        $this->info("- Users: {$userCount}");
        $this->info("- Activity Categories: {$categoryCount}");
        $this->newLine();

        // Sample activity with relationships
        $sampleActivity = Activity::with(['user', 'activityCategory', 'sessions'])->first();

        if ($sampleActivity) {
            $this->info("📝 Sample Activity:");
            $this->info("- ID: {$sampleActivity->id}");
            $this->info("- Description: {$sampleActivity->description}");
            $this->info("- User: {$sampleActivity->user->name}");
            $this->info("- Category: {$sampleActivity->activityCategory->name}");
            $this->info("- Status: {$sampleActivity->status}");
            $this->info("- Sessions: {$sampleActivity->sessions->count()}");
            $this->info("- Duration: {$sampleActivity->duration} minutes");
            $this->newLine();
        }

        // Date range analysis
        $oldestActivity = Activity::orderBy('started_at')->first();
        $newestActivity = Activity::orderBy('started_at', 'desc')->first();

        if ($oldestActivity && $newestActivity) {
            $this->info("📅 Date Range:");
            $this->info("- Oldest: " . $oldestActivity->started_at->format('Y-m-d H:i:s'));
            $this->info("- Newest: " . $newestActivity->started_at->format('Y-m-d H:i:s'));
            $this->newLine();
        }

        // Status distribution
        $statusCounts = Activity::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $this->info("📈 Status Distribution:");
        foreach ($statusCounts as $status => $count) {
            $percentage = round(($count / $activityCount) * 100, 1);
            $this->info("- " . ucfirst($status) . ": {$count} ({$percentage}%)");
        }
        $this->newLine();

        // Category usage (top 10)
        $categoryCounts = Activity::with('activityCategory')
            ->selectRaw('activity_category_id, COUNT(*) as count')
            ->groupBy('activity_category_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $this->info("🏷️ Top 10 Categories:");
        foreach ($categoryCounts as $categoryData) {
            $categoryName = $categoryData->activityCategory->name ?? 'Unknown';
            $this->info("- {$categoryName}: {$categoryData->count} activities");
        }
        $this->newLine();

        // User activity distribution (top 10)
        $userCounts = Activity::with('user')
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $this->info("👥 Top 10 Active Users:");
        foreach ($userCounts as $userData) {
            $userName = $userData->user->name ?? 'Unknown';
            $this->info("- {$userName}: {$userData->count} activities");
        }
        $this->newLine();

        // Session statistics
        $avgSessionsPerActivity = round($sessionCount / $activityCount, 1);
        $avgSessionDuration = ActivitySession::avg('duration');
        $totalMinutes = ActivitySession::sum('duration');
        $totalHours = round($totalMinutes / 60, 1);

        $this->info("⏱️ Session Statistics:");
        $this->info("- Average sessions per activity: {$avgSessionsPerActivity}");
        $this->info("- Average session duration: " . round($avgSessionDuration, 1) . " minutes");
        $this->info("- Total time tracked: {$totalHours} hours ({$totalMinutes} minutes)");
        $this->newLine();

        $this->info("✅ Test data verification complete!");
        $this->info("🎯 Your Activity Reports page should now have plenty of data to work with!");
    }
}
