<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $fillable = ['image_path', 'name', 'description', 'due_date', 'status', 'created_by', 'updated_by'] ;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'due_date' => 'date',
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
