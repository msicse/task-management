<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class TasksExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $tasks;

    public function __construct($tasks)
    {
        $this->tasks = $tasks;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->tasks;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Description',
            'Status',
            'Priority',
            'Category',
            'Assigned To',
            'Created By',
            'Due Date',
            'Time Spent(minutes)',
            'Created At',
            'Updated At',
            'Completed At',
        ];
    }

    /**
     * @param mixed $task
     * @return array
     */
    public function map($task): array
    {
        return [
            $task->id,
            $task->name,
            strip_tags($task->description),
            ucfirst($task->status),
            ucfirst($task->priority),
            $task->category ? $task->category->name : 'None',
            $task->assignedUser ? $task->assignedUser->name : 'Unassigned',
            $task->createdBy ? $task->createdBy->name : 'Unknown',
            $task->due_date ? $task->due_date->format('Y-m-d') : 'N/A',
            $task->time_log ? $task->time_log : '0',
            $task->created_at->format('Y-m-d H:i'),
            $task->updated_at->format('Y-m-d H:i'),
            $task->completed_at ? $task->completed_at->format('Y-m-d H:i') : 'Not completed',
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row (headings)
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => [
                        'rgb' => 'D3D3D3',
                    ],
                ],
            ],
        ];
    }
}
