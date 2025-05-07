<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image_path',
        'due_date',
        'status',
        'assigned_user_id',
        'factory_id',
        'category_id',
        'priority',
        'created_by',
        'updated_by',
        'project_id',
        'completed_at',
        'approved_at',
        'creator_rating',
        'assignee_rating',
        'time_log',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'date',
        'approved_at' => 'date',
    ];

    /**
     * Set the due date in the correct format for database storage
     *
     * @param string $value
     * @return void
     */
    public function setDueDateAttribute($value)
    {
        if ($value) {
            // Check if date is in DD-MM-YYYY format
            if (preg_match('/^(\d{2})-(\d{2})-(\d{4})$/', $value, $matches)) {
                // Convert to YYYY-MM-DD format
                $this->attributes['due_date'] = "{$matches[3]}-{$matches[2]}-{$matches[1]}";
            } else {
                // Otherwise use the value as is (assuming it's already in a valid format)
                $this->attributes['due_date'] = $value;
            }
        } else {
            $this->attributes['due_date'] = null;
        }
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, "assigned_user_id");
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, "created_by");
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, "updated_by");
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->with(['user', 'replies.user'])->latest();
    }

    public function files()
    {
        return $this->hasMany(TaskFile::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
