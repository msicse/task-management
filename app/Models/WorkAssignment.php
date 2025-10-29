<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkAssignment extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Activity categories assigned to this work assignment
     */
    public function activityCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            ActivityCategory::class,
            'work_assignment_categories'
        );
    }

    /**
     * Users assigned to this work assignment
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_work_assignments'
        );
    }

    /**
     * Get activities through assigned categories
     */
    public function activities()
    {
        return Activity::whereIn('activity_category_id',
            $this->activityCategories->pluck('id')
        );
    }
}
