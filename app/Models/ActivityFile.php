<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityFile extends Model
{
    protected $fillable = [
        'activity_id',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function getFileSizeInKBAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        return number_format($this->file_size / 1024, 2) . ' KB';
    }

    public function getFileSizeInMBAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        return number_format($this->file_size / (1024 * 1024), 2) . ' MB';
    }

    public function getFileExtensionAttribute(): ?string
    {
        if (!$this->original_name) {
            return null;
        }

        return pathinfo($this->original_name, PATHINFO_EXTENSION);
    }

    public function isImage(): bool
    {
        return in_array($this->mime_type, [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ]);
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }
}
