<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CategoryAssignment extends Model
{
    protected $table = 'activity_category_role';

    protected $fillable = [
        'role_id',
        'activity_category_id',
        'assigned_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    // This represents the assignment relationship, not permission roles
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function activityCategory()
    {
        return $this->belongsTo(ActivityCategory::class);
    }

    // Get users assigned to this category through their roles
    public function assignedUsers()
    {
        return User::role($this->role->name);
    }
}
