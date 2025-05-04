<?php

namespace App\Models;

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
        'creator_rating',
        'assignee_rating',
    ];

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
