<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'activity_category_id',
        'description',
        'status',
        'started_at',
        'ended_at',
        'duration',
        'count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activityCategory(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ActivityFile::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ActivitySession::class);
    }

    public function startActivity(): void
    {
        $now = now();

        // Update activity status and started_at
        $this->update([
            'status' => 'started',
            'started_at' => $now,
            'ended_at' => null,
        ]);

        // Create a new session for this start
        $this->sessions()->create([
            'started_at' => $now,
        ]);

        // Refresh the model to ensure we have the latest data
        $this->refresh();
    }

    public function pauseActivity(): void
    {
        $now = now();

        if ($this->status === 'started') {
            // End the current active session
            $activeSession = $this->sessions()->whereNull('ended_at')->first();
            if ($activeSession) {
                $activeSession->update(['ended_at' => $now]);
                $activeSession->calculateDuration();
            }

            // Recalculate total duration
            $this->calculateTotalDuration();
        }

        $this->update([
            'status' => 'paused',
            'ended_at' => $now,
        ]);

        // Refresh to get latest data
        $this->refresh();
    }

    public function completeActivity(): void
    {
        $now = now();

        // If activity is currently started, end the active session
        if ($this->status === 'started') {
            $activeSession = $this->sessions()->whereNull('ended_at')->first();
            if ($activeSession) {
                $activeSession->update(['ended_at' => $now]);
                $activeSession->calculateDuration();
            }
        }

        // Always recalculate total duration before completing
        $this->calculateTotalDuration();

        // Update status to completed
        $this->update([
            'status' => 'completed',
            'ended_at' => $now,
        ]);

        // Refresh to get latest data including the calculated duration
        $this->refresh();
    }

    public function calculateTotalDuration(): void
    {
        // Calculate total duration from all completed sessions

        // Sum stored session durations (sessions store minutes as float)
        $totalDuration = $this->sessions()->whereNotNull('ended_at')->sum('duration') ?? 0.0;

        // If there's an active session, add its current duration (use seconds for precision)
        $activeSession = $this->sessions()->whereNull('ended_at')->first();
        if ($activeSession) {
            $currentSeconds = $activeSession->started_at->diffInSeconds(now());
            $currentDuration = $currentSeconds / 60.0;
            $totalDuration += $currentDuration;
        }

        // Ensure we always have a valid non-negative float and persist rounded minutes
        $totalDuration = max(0.0, (float)$totalDuration);

        $this->update(['duration' => round($totalDuration, 2)]);

        // Force refresh to ensure the change is saved
        $this->refresh();
    }

    public function getCurrentSessionDuration(): float
    {
        $activeSession = $this->sessions()->whereNull('ended_at')->first();
        if ($activeSession) {
            $seconds = $activeSession->started_at->diffInSeconds(now());
            return $seconds / 60.0;
        }
        return 0;
    }

    public function getTotalDurationFromSessions(): float
    {
        // Get total from completed sessions (minutes as float)
        $completedDuration = $this->sessions()->whereNotNull('ended_at')->sum('duration') ?? 0.0;

        // Add current session duration if active (use seconds for precision)
        $activeSeconds = 0;
        $activeSession = $this->sessions()->whereNull('ended_at')->first();
        if ($activeSession) {
            $activeSeconds = $activeSession->started_at->diffInSeconds(now());
        }

        $totalMinutes = $completedDuration + ($activeSeconds / 60.0);

        // Return float minutes
        return $totalMinutes;
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->whereIn('status', ['started', 'paused']);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('activity_category_id', $categoryId);
    }

    public function getTotalDurationAttribute(): string
    {
        // First try to get duration from the stored value
        $duration = $this->duration;

        // If no stored duration, calculate from sessions (may return integer minutes)
        if (!$duration || $duration == 0) {
            $duration = $this->getTotalDurationFromSessions();
        }

        // If still no duration, return 0
        if (!$duration || $duration == 0) {
            return '0m';
        }

        // Duration is stored in minutes (float). If less than 1 minute, show seconds.
        if ($duration > 0 && $duration < 1) {
            $seconds = (int) round($duration * 60);
            return $seconds . 's';
        }

        // For one or more minutes, show minutes and hours where appropriate.
        $hours = intval($duration / 60);
        $remainingMinutes = $duration - ($hours * 60);

        // If there are hours, show "Xh Ym" with integer minutes
        if ($hours > 0) {
            $minutesInt = intval(round($remainingMinutes));
            return $hours . 'h ' . $minutesInt . 'm';
        }

        // Less than an hour: show minutes. If fractional, display with one decimal place.
        if (floor($duration) != $duration) {
            return rtrim(rtrim(number_format($duration, 2, '.', ''), '0'), '.') . 'm';
        }

        return intval($duration) . 'm';
    }

    /**
     * Pause all active (started) activities for a specific user
     */
    public static function pauseAllActiveForUser($userId, $excludeActivityId = null): void
    {
        $activeActivities = self::where('user_id', $userId)
            ->where('status', 'started')
            ->when($excludeActivityId, function ($query) use ($excludeActivityId) {
                return $query->where('id', '!=', $excludeActivityId);
            })
            ->get();

        foreach ($activeActivities as $activity) {
            $activity->pauseActivity();
        }
    }

    /**
     * Start this activity and automatically pause all other active activities for the user
     */
    public function startActivityExclusive(): void
    {
        // First pause all other active activities for this user (excluding this activity)
        self::pauseAllActiveForUser($this->user_id, $this->id);

        // Then start this activity
        $this->startActivity();
    }

    /**
     * Recalculate durations for all sessions and update total duration
     */
    public function recalculateAllDurations(): void
    {
        // Recalculate duration for all sessions that have both start and end times
        foreach ($this->sessions()->whereNotNull('ended_at')->get() as $session) {
            $session->calculateDuration();
        }

        // Recalculate total duration
        $this->calculateTotalDuration();
    }
}
