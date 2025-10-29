<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivitySession extends Model
{
    protected $fillable = [
        'activity_id',
        'started_at',
        'ended_at',
        'duration',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function calculateDuration(): void
    {
        if ($this->started_at && $this->ended_at) {
            // Use seconds to preserve sub-minute precision, store duration as minutes (float)
            $seconds = $this->started_at->diffInSeconds($this->ended_at);
            $this->duration = $seconds / 60.0;
            // Round to 2 decimal places to keep DB values compact but precise enough for display
            $this->duration = round($this->duration, 2);
            $this->save();
        }
    }
}
