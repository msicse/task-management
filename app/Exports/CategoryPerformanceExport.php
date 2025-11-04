<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CategoryPerformanceExport implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected $data;
    protected $startDate;
    protected $endDate;
    protected $userId;

    public function __construct($data, $startDate, $endDate, $userId = null)
    {
        $this->data = $data;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->userId = $userId;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($row) {
            return [
                $row['Sub-Category'],
                $row['Standard Time (min)'],
                $row['Total Performed Time (min)'],
                $row['Total Activity Count'],
                $row['Total User Count'],
                $row['Average Performed Time (min)'],
                $row['Limit/Remark'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Sub-Category',
            'Standard Time (min)',
            'Total Performed Time (min)',
            'Total Activity Count',
            'Total User Count',
            'Average Performed Time (min)',
            'Limit/Remark',
        ];
    }

    public function title(): string
    {
        return 'Category Performance';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold
            1 => ['font' => ['bold' => true]],
        ];
    }
}
