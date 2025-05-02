<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'name',
        'original_name',
        'path',
        'mime_type',
        'size',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFileIcon()
    {
        $extension = pathinfo($this->original_name, PATHINFO_EXTENSION);

        switch (strtolower($extension)) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fa-file-powerpoint';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'fa-file-image';
            case 'zip':
            case 'rar':
                return 'fa-file-archive';
            default:
                return 'fa-file';
        }
    }

    public function getFileSizeForHumans()
    {
        $bytes = $this->size;
        // Convert bytes to KB and round to 2 decimal places
        return round($bytes / 1024, 2) . ' KB';
    }
}
