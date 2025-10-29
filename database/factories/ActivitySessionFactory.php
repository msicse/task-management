<?php

namespace Database\Factories;

use App\Models\ActivitySession;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ActivitySessionFactory extends Factory
{
    protected $model = ActivitySession::class;

    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-2 months', 'now');
        $carbonStarted = Carbon::instance($startedAt);
        $duration = $this->faker->numberBetween(15, 240); // 15 minutes to 4 hours
        $endedAt = $carbonStarted->copy()->addMinutes($duration);

        return [
            'activity_id' => Activity::factory(),
            'started_at' => $carbonStarted,
            'ended_at' => $endedAt,
            'duration' => $duration,
        ];
    }

    public function forActivity(Activity $activity): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_id' => $activity->id,
        ]);
    }

    public function shortSession(): static
    {
        return $this->state(function (array $attributes) {
            $startedAt = Carbon::parse($attributes['started_at']);
            $duration = $this->faker->numberBetween(15, 60); // 15 minutes to 1 hour
            $endedAt = $startedAt->copy()->addMinutes($duration);

            return [
                'ended_at' => $endedAt,
                'duration' => $duration,
            ];
        });
    }

    public function longSession(): static
    {
        return $this->state(function (array $attributes) {
            $startedAt = Carbon::parse($attributes['started_at']);
            $duration = $this->faker->numberBetween(120, 480); // 2 to 8 hours
            $endedAt = $startedAt->copy()->addMinutes($duration);

            return [
                'ended_at' => $endedAt,
                'duration' => $duration,
            ];
        });
    }
}
