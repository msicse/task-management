<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkRole extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
        'department_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Activity categories assigned to this work role
     */
    public function activityCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            ActivityCategory::class,
            'work_role_categories',
            'work_role_id',
            'activity_category_id'
        )->withTimestamps();
    }

    /**
     * Users assigned to this work role
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_work_roles',
            'work_role_id',
            'user_id'
        )->withTimestamps();
    }

    /**
     * Department this work role belongs to
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get all activities for categories assigned to this work role
     */
    public function activities()
    {
        $categoryIds = $this->activityCategories->pluck('id');
        return Activity::whereIn('activity_category_id', $categoryIds);
    }

    /**
     * Check if this work role has access to a specific category
     */
    public function hasAccessToCategory($categoryId): bool
    {
        return $this->activityCategories()->where('activity_category_id', $categoryId)->exists();
    }
}
