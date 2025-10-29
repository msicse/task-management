<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class ActivitiesExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    public function __construct(private Collection $activities, private $start, private $end)
    {
    }

    public function collection(): Collection
    {
        return $this->activities;
    }

    public function headings(): array
    {
        return [
            'ID',
            'User',
            'Department',
            'Category',
            'Count',
            'Standard Time (minutes)',
            'Description',
            'Status',
            'Started At',
            'Ended At',
            'Duration (minutes)'
        ];
    }

    public function map($activity): array
    {
        return [
            $activity->id,
            optional($activity->user)->name,
            optional($activity->user?->department)->name,
            optional($activity->activityCategory)->name,
            $activity->count ?? 0,
            optional($activity->activityCategory)->standard_time ?: 'Not set',
            $activity->description,
            $activity->status,
            optional($activity->started_at)?->toDateTimeString(),
            optional($activity->ended_at)?->toDateTimeString(),
            round((float)($activity->duration ?? 0), 2),
        ];
    }

    public function title(): string
    {
        return 'Activities ' . $this->start->toDateString() . ' to ' . $this->end->toDateString();
    }
}
