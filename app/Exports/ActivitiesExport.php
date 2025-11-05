<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class ActivitiesExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    public function __construct(private Collection $activitySums, private $start, private $end)
    {
    }

    public function collection(): Collection
    {
        return $this->activitySums;
    }

    public function headings(): array
    {
        return [
            'Activity ID',
            'User',
            'Department',
            'Category',
            'Count',
            'Standard Time (min)',
            'Description',
            'Status',
            'Started At',
            'Ended At',
            'Duration (min)'
        ];
    }

    public function map($activitySum): array
    {
        $activity = $activitySum['activity'];

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
            $activitySum['total_duration'], // Use summed session duration
        ];
    }

    public function title(): string
    {
        return 'Activities ' . $this->start->toDateString() . ' to ' . $this->end->toDateString();
    }
}
