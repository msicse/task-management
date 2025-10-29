<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use App\Models\ActivitySession;
use App\Models\User;
use App\Models\ActivityCategory;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ActivityTestDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Get existing users and activity categories
        $users = User::all();
        $activityCategories = ActivityCategory::all();

        if ($users->isEmpty()) {
            $this->command->error('No users found! Please create users first.');
            return;
        }

        if ($activityCategories->isEmpty()) {
            $this->command->error('No activity categories found! Please create activity categories first.');
            return;
        }

        $this->command->info('Creating 500+ activities with sessions...');

        // Generic activity descriptions that work with any category
        $genericDescriptions = [
            'Working on assigned tasks and deliverables',
            'Reviewing and updating documentation',
            'Coordinating with team members and stakeholders',
            'Following up on pending items and communications',
            'Preparing reports and analysis',
            'Conducting meetings and consultations',
            'Processing requests and applications',
            'Monitoring and tracking progress',
            'Providing guidance and recommendations',
            'Implementing improvements and solutions',
            'Analyzing data and preparing insights',
            'Managing schedules and timelines',
            'Conducting research and investigations',
            'Facilitating communication between parties',
            'Ensuring compliance with protocols',
            'Updating systems and databases',
            'Reviewing and approving submissions',
            'Coordinating with external partners',
            'Preparing presentations and materials',
            'Managing escalations and priority issues'
        ];

        $statuses = ['started', 'paused', 'completed'];

        // Generate activities over the last 3 months
        $startDate = Carbon::now()->subMonths(3);
        $endDate = Carbon::now();

        $activitiesCreated = 0;
        $sessionsCreated = 0;

        // Create 500+ activities
        for ($i = 0; $i < 550; $i++) {
            $user = $users->random();
            $category = $activityCategories->random();
            $status = $faker->randomElement($statuses);

            // Get random description from generic descriptions
            $description = $faker->randomElement($genericDescriptions);

            // Random date within the last 3 months
            $activityDate = $faker->dateTimeBetween($startDate, $endDate);
            $carbonDate = Carbon::instance($activityDate);

            // Create activity
            $activity = Activity::create([
                'user_id' => $user->id,
                'activity_category_id' => $category->id,
                'description' => $description,
                'status' => $status,
                'started_at' => $carbonDate,
                'ended_at' => $status === 'completed' ? $carbonDate->copy()->addMinutes($faker->numberBetween(30, 480)) : null,
                'duration' => null, // Will be calculated from sessions
            ]);

            $activitiesCreated++;

            // Create 1-5 sessions per activity
            $sessionCount = $faker->numberBetween(1, 5);
            $totalDuration = 0;

            for ($j = 0; $j < $sessionCount; $j++) {
                // Sessions spread across the same day or next few days
                $sessionStart = $carbonDate->copy()->addDays($j)->addMinutes($faker->numberBetween(0, 480));
                $sessionDuration = $faker->numberBetween(15, 240); // 15 minutes to 4 hours
                $sessionEnd = $sessionStart->copy()->addMinutes($sessionDuration);

                ActivitySession::create([
                    'activity_id' => $activity->id,
                    'started_at' => $sessionStart,
                    'ended_at' => $sessionEnd,
                    'duration' => $sessionDuration,
                ]);

                $totalDuration += $sessionDuration;
                $sessionsCreated++;
            }

            // Update activity with total duration
            $activity->update(['duration' => $totalDuration]);

            // Progress indicator
            if (($i + 1) % 50 === 0) {
                $this->command->info("Created " . ($i + 1) . " activities...");
            }
        }

        $this->command->info("✅ Successfully created {$activitiesCreated} activities and {$sessionsCreated} activity sessions!");

        // Show some statistics
        $this->command->info("\n📊 Statistics:");
        $this->command->info("- Total Activities: " . Activity::count());
        $this->command->info("- Total Sessions: " . ActivitySession::count());
        $this->command->info("- Date Range: {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");
        $this->command->info("- Users with Activities: " . Activity::distinct('user_id')->count());
        $this->command->info("- Categories Used: " . Activity::distinct('activity_category_id')->count());

        // Status breakdown
        $statusCounts = Activity::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $this->command->info("\n📈 Status Distribution:");
        foreach ($statusCounts as $status => $count) {
            $this->command->info("- " . ucfirst($status) . ": {$count}");
        }
    }
}
