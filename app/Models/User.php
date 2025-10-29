<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'designation',
        'employee_id',
        'phone',
        'blood',
        'gender',
        'location',
        'date_of_join',
        'date_of_resign',
        'status',
        'about',
        'image',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_join' => 'date',
            'date_of_resign' => 'date',
        ];
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }



    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_user_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get activity categories applicable to this user's roles
     */
    /**
     * Get activity categories assigned to user through work roles (NEW SYSTEM)
     */
    public function getAssignedActivityCategories()
    {
        return $this->getWorkRoleCategories();
    }

    /**
     * Backward compatibility - now uses new work role system
     */
    public function getApplicableActivityCategories()
    {
        return $this->getAssignedActivityCategories();
    }

    /**
     * Get work assignments for this user (old system - being deprecated)
     */
    public function workAssignments()
    {
        return $this->belongsToMany(WorkAssignment::class, 'user_work_assignments');
    }

    /**
     * Get work roles for this user (new system)
     */
    public function workRoles()
    {
        return $this->belongsToMany(WorkRole::class, 'user_work_roles')->withTimestamps();
    }

    /**
     * Get activity categories through work roles (new system)
     */
    public function getWorkRoleCategories()
    {
        return ActivityCategory::whereIn('id',
            $this->workRoles()
                ->with('activityCategories')
                ->get()
                ->pluck('activityCategories')
                ->flatten()
                ->pluck('id')
                ->unique()
        )->get();
    }

    /**
     * Check if user has permission to perform action (uses Spatie permissions)
     */
    public function canPerformAction($permission)
    {
        return $this->can($permission);
    }

    /**
     * Check if user is assigned to work on specific category (NEW SYSTEM)
     */
    public function isAssignedToCategory($categoryId)
    {
        return $this->workRoles()
            ->whereHas('activityCategories', function($query) use ($categoryId) {
                $query->where('activity_category_id', $categoryId);
            })
            ->exists();
    }

    /**
     * Check if user can access a specific category
     */
    public function canAccessActivityCategory($categoryName)
    {
        $applicableCategories = $this->getApplicableActivityCategories();
        return $applicableCategories->where('name', $categoryName)->isNotEmpty();
    }

    /**
     * Check if user can access a specific category by ID
     */
    public function canAccessActivityCategoryById($categoryId)
    {
        $applicableCategories = $this->getApplicableActivityCategories();
        return $applicableCategories->where('id', $categoryId)->isNotEmpty();
    }
}
