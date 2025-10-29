<?php

namespace App\Exports;

use App\Models\Department;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ActivityCategoryTemplateExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    public function array(): array
    {
        return [
            // Row 2: Parent category example
            ['CREATE', 'Project Management', '', 'Managing project activities', 120, '', 'Project Manager,Team Lead,Senior Manager', 'Information Technology'],

            // Row 3: Child category example - put parent code in column F
            ['CREATE', 'Planning', '', 'Project planning activities', 60, 'IT_PM', 'Project Manager,Planner', 'Information Technology'],

            // Row 4: Another parent category
            ['CREATE', 'Quality Assurance', '', 'Quality control activities', 45, '', 'QA Manager,QA Specialist,Tester', 'Remediation Programme Department'],

            // Row 5: Child category with parent reference
            ['CREATE', 'Testing', '', 'Software testing activities', 30, 'RPD_QA', 'Tester,Automation Engineer', 'Remediation Programme Department'],

            // Row 6: Another child example
            ['UPDATE', 'Execution', 'IT_PM_002', 'Updated project execution activities', 90, 'IT_PM', 'Team Lead,Developer', 'Information Technology'],

            // Row 7: Empty row for user input
            ['', '', '', '', '', '', '', ''],
        ];
    }

    public function headings(): array
    {
        return [
            'action',
            'category_name',
            'category_code',
            'category_description',
            'standard_time',
            'parent_category_code',
            'role_names',
            'department_name',
            'reference_protocol',
            'objective'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5']
                ]
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10, // action
            'B' => 20, // category_name
            'C' => 15, // category_code
            'D' => 30, // category_description
            'E' => 12, // standard_time
            'F' => 18, // parent_category_code
            'G' => 30, // role_names (increased width for multiple roles)
            'H' => 20, // department_name
            'I' => 10, // reference_protocol
            'J' => 10, // objective
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Create Excel formulas for automatic code generation
                // Formula combines: LEFT(G2,3) + "_" + area code mapping + "_" + sequence

                // Add formulas to category_code column (C) for rows 2-7
                // Original Design Logic: Main categories = DEPT_AREA, Sub-categories = DEPT_AREA_001
                $codeFormulas = [
                    // Row 2: Main category (no parent) = DEPT_AREA format
                    'C2' => '=IF(AND(A2="CREATE",B2<>""),IF(F2="",IF(H2<>"",UPPER(LEFT(SUBSTITUTE(H2," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B2))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B2))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B2))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B2))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B2))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B2))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B2))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B2))),"DOC","GEN")))))))),""),F2&"_001"),"")',

                    'C3' => '=IF(AND(A3="CREATE",B3<>""),IF(F3="",IF(H3<>"",UPPER(LEFT(SUBSTITUTE(H3," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B3))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B3))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B3))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B3))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B3))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B3))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B3))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B3))),"DOC","GEN")))))))),""),F3&"_002"),"")',

                    'C4' => '=IF(AND(A4="CREATE",B4<>""),IF(F4="",IF(H4<>"",UPPER(LEFT(SUBSTITUTE(H4," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B4))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B4))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B4))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B4))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B4))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B4))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B4))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B4))),"DOC","GEN")))))))),""),F4&"_001"),"")',

                    'C5' => '=IF(AND(A5="CREATE",B5<>""),IF(F5="",IF(H5<>"",UPPER(LEFT(SUBSTITUTE(H5," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B5))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B5))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B5))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B5))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B5))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B5))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B5))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B5))),"DOC","GEN")))))))),""),F5&"_002"),"")',

                    'C6' => '=IF(AND(A6="CREATE",B6<>""),IF(F6="",IF(H6<>"",UPPER(LEFT(SUBSTITUTE(H6," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B6))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B6))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B6))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B6))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B6))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B6))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B6))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B6))),"DOC","GEN")))))))),""),F6&"_001"),"")',

                    'C7' => '=IF(AND(A7="CREATE",B7<>""),IF(F7="",IF(H7<>"",UPPER(LEFT(SUBSTITUTE(H7," ",""),3))&"_"&IF(ISNUMBER(SEARCH("project",LOWER(B7))),"PM",IF(ISNUMBER(SEARCH("quality",LOWER(B7))),"QA",IF(ISNUMBER(SEARCH("test",LOWER(B7))),"TST",IF(ISNUMBER(SEARCH("develop",LOWER(B7))),"DEV",IF(ISNUMBER(SEARCH("manage",LOWER(B7))),"MGT",IF(ISNUMBER(SEARCH("plan",LOWER(B7))),"PLN",IF(ISNUMBER(SEARCH("design",LOWER(B7))),"DES",IF(ISNUMBER(SEARCH("document",LOWER(B7))),"DOC","GEN")))))))),""),F7&"_002"),"")',
                ];

                // Set formulas
                foreach ($codeFormulas as $cell => $formula) {
                    $sheet->setCellValue($cell, $formula);
                }

                // Add instructions as comments
                $sheet->getComment('A1')->getText()->createTextRun('Action: CREATE = Create new category, UPDATE = Update existing category (requires existing code in column C)');
                $sheet->getComment('C1')->getText()->createTextRun('Auto-generated codes for CREATE action: Parent/Single categories = DEPT_AREA (e.g. IT_PM). Child categories = PARENT_CODE_001 (e.g. IT_PM_001). For UPDATE action, enter the existing category code.');
                $sheet->getComment('F1')->getText()->createTextRun('For child categories, enter the parent category code here (e.g. IT_PM). Leave empty for parent/single categories.');
                $sheet->getComment('H1')->getText()->createTextRun('Select department from dropdown. Department names must match exactly as shown in the dropdown list.');

                // Style the formula cells with light background
                $sheet->getStyle('C2:C7')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E3F2FD');

                // Add data validation for Action column
                $actionValidation = $sheet->getDataValidation('A2:A1000');
                $actionValidation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                $actionValidation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                $actionValidation->setAllowBlank(false);
                $actionValidation->setShowInputMessage(true);
                $actionValidation->setShowErrorMessage(true);
                $actionValidation->setShowDropDown(true);
                $actionValidation->setErrorTitle('Invalid Action');
                $actionValidation->setError('Please select CREATE or UPDATE from the dropdown');
                $actionValidation->setPromptTitle('Select Action');
                $actionValidation->setPrompt('Choose CREATE to create new category or UPDATE to modify existing category');
                $actionValidation->setFormula1('"CREATE,UPDATE"');

                // Add data validation for Department column with database values
                $departments = Department::orderBy('name')->get(['name'])->pluck('name')->toArray();
                $departmentList = '"' . implode(',', $departments) . '"';

                $deptValidation = $sheet->getDataValidation('H2:H1000');
                $deptValidation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
                $deptValidation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
                $deptValidation->setAllowBlank(false);
                $deptValidation->setShowInputMessage(true);
                $deptValidation->setShowErrorMessage(true);
                $deptValidation->setShowDropDown(true);
                $deptValidation->setErrorTitle('Invalid Department');
                $deptValidation->setError('Please select a valid department from the dropdown');
                $deptValidation->setPromptTitle('Select Department');
                $deptValidation->setPrompt('Choose a department from the list of available departments');
                $deptValidation->setFormula1($departmentList);
                // Department reference table removed as per user request. Only dropdown remains.
            },
        ];
    }
}
