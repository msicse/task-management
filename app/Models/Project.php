<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $fillable = ['image_path', 'name', 'description', 'due_date', 'status', 'created_by', 'updated_by'] ;

    function tasks() {
        return $this->hasMany(Task::class);
    }

    function createdBy() {
        return $this-> BelongsTo(User::class, 'created_by');
    }

    function updatedBy() {
        return $this-> BelongsTo(User::class, 'updated_by');
    }

}
