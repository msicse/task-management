<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\User;
use App\Models\ActivityCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-3 months', 'now');
        $carbonStarted = Carbon::instance($startedAt);

        $status = $this->faker->randomElement(['started', 'paused', 'completed']);
        $endedAt = $status === 'completed' ?
            $carbonStarted->copy()->addMinutes($this->faker->numberBetween(30, 480)) :
            null;

        return [
            'user_id' => User::factory(),
            'activity_category_id' => ActivityCategory::factory(),
            'description' => $this->faker->randomElement([
                'Implementing new user authentication system',
                'Bug fixing in payment processing module',
                'Code review for frontend components',
                'Database optimization and query tuning',
                'API integration with third-party services',
                'Writing unit tests for core functionality',
                'UI/UX design for mobile application',
                'Social media campaign planning',
                'Customer support ticket resolution',
                'Team performance review meetings',
                'Market research and competitor analysis',
                'System maintenance and updates',
                'Project planning and resource allocation',
                'Content creation for blog posts',
                'Technical documentation update'
            ]),
            'status' => $status,
            'started_at' => $carbonStarted,
            'ended_at' => $endedAt,
            'duration' => $endedAt ? $carbonStarted->diffInMinutes($endedAt) : null,
        ];
    }

    public function started(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'started',
            'ended_at' => null,
            'duration' => null,
        ]);
    }

    public function paused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paused',
            'ended_at' => null,
            'duration' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $startedAt = Carbon::parse($attributes['started_at']);
            $duration = $this->faker->numberBetween(30, 480);
            $endedAt = $startedAt->copy()->addMinutes($duration);

            return [
                'status' => 'completed',
                'ended_at' => $endedAt,
                'duration' => $duration,
            ];
        });
    }
}
