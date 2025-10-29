<?php

namespace App\Http\Controllers;

use App\Imports\ActivityCatImport;
use App\Imports\ActivityImport;
use App\Models\ActivityCategory;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\ActivityCategoryRequest;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ActivityCategoryImport;

class ActivityCategoryController extends Controller
{
    /**
     * Download new activity import template (CSV)
     */
    public function downloadNewTemplate()
    {
        $filePath = public_path('new_template.csv');
        $fileName = 'new_template.csv';
        return response()->download($filePath, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    $query = ActivityCategory::query()->withCount('activities')->with(['parent', 'department']);

        $sortField = request('sort_field', 'created_at');
        $sortDirection = request('sort_direction', 'desc');
        $perPage = request('per_page', 10);

        if (request('name')) {
            $query->where('name', 'like', '%' . request('name') . '%');
        }

        // Filter by parent category
        if (request('parent_filter') !== null) {
            if (request('parent_filter') === 'no_parent') {
                $query->whereNull('parent_id');
            } elseif (request('parent_filter') !== '') {
                $query->where('parent_id', request('parent_filter'));
            }
        }

        // Filter by department
        if (request('department_filter')) {
            $query->where('department_id', request('department_filter'));
        }

        $categories = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString()
            ->onEachSide(2);

        $categories->setPath(request()->url());

        $paginated = $categories->through(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'code' => $cat->code,
                'standard_time' => $cat->standard_time,
                'definition' => $cat->definition,
                'reference_protocol' => $cat->reference_protocol,
                'objective' => $cat->objective,
                'department' => $cat->department ? [
                    'id' => $cat->department->id,
                    'name' => $cat->department->name,
                    'short_name' => $cat->department->short_name,
                ] : null,
                'parent' => $cat->parent ? [
                    'id' => $cat->parent->id,
                    'name' => $cat->parent->name,
                ] : null,
                'created_at' => $cat->created_at,
                'updated_at' => $cat->updated_at,
                'activities_count' => $cat->activities_count ?? 0,
            ];
        });

        $formatted = [
            'data' => $paginated->items(),
            // Provide links as array for Pagination component
            'links' => $categories->toArray()['links'] ?? [],
            'meta' => [
                'current_page' => $categories->currentPage(),
                'from' => $categories->firstItem(),
                'last_page' => $categories->lastPage(),
                'path' => $categories->path(),
                'per_page' => $categories->perPage(),
                'to' => $categories->lastItem(),
                'total' => $categories->total(),
            ],
        ];

        // Get parent categories for filter dropdown
        $parentCategories = ActivityCategory::whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Get departments for filter dropdown
        $departments = \App\Models\Department::orderBy('name')
            ->get(['id', 'name', 'short_name']);

        // Get all main categories for Dashboard select
        $allMainCategories = ActivityCategory::whereNull('parent_id')->orderBy('name')->get(['id', 'name']);
        // Get all categories for grouped select
        $allCategories = ActivityCategory::orderBy('name')->get(['id', 'name', 'parent_id']);

        return inertia('ActivityCategories/Index', [
            'categories' => $formatted,
            'parentCategories' => $parentCategories,
            'departments' => $departments,
            'allMainCategories' => $allMainCategories,
            'allCategories' => $allCategories,
            'queryParams' => request()->only(['name', 'sort_field', 'sort_direction', 'per_page', 'parent_filter', 'department_filter']),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = ActivityCategory::whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = \App\Models\Department::orderBy('name')
            ->get(['id', 'name', 'short_name']);

        return inertia('ActivityCategories/Create', [
            'parentCategories' => $parentCategories,
            'departments' => $departments,
            'success' => session('success'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ActivityCategoryRequest $request)
    {
        ActivityCategory::create($request->validated());

        return redirect()->route('activity-categories.index')
            ->with('success', 'Activity category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ActivityCategory $activityCategory)
    {
        return inertia('ActivityCategories/Show', [
            'category' => $activityCategory->load('activities'),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ActivityCategory $activityCategory)
    {
        $parentCategories = ActivityCategory::whereNull('parent_id')
            ->where('id', '!=', $activityCategory->id) // Exclude self to prevent circular reference
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = \App\Models\Department::orderBy('name')
            ->get(['id', 'name', 'short_name']);

        return inertia('ActivityCategories/Edit', [
            'category' => $activityCategory->load('department'),
            'parentCategories' => $parentCategories,
            'departments' => $departments,
            'success' => session('success'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ActivityCategoryRequest $request, ActivityCategory $activityCategory)
    {
        $validatedData = $request->validated();

        \Log::info('Activity Category Update Request', [
            'category_id' => $activityCategory->id,
            'original_data' => $activityCategory->toArray(),
            'validated_data' => $validatedData
        ]);

        // Check if name or department changed, regenerate code
        if (($validatedData['name'] !== $activityCategory->name) ||
            ($validatedData['department_id'] != $activityCategory->department_id) ||
            ($validatedData['parent_id'] != $activityCategory->parent_id)) {

            $tempCategory = clone $activityCategory;
            $tempCategory->fill($validatedData);
            $validatedData['code'] = ActivityCategory::generateUniqueCode($tempCategory);

            \Log::info('Regenerated code due to field changes', [
                'old_code' => $activityCategory->code,
                'new_code' => $validatedData['code']
            ]);
        }

        $activityCategory->update($validatedData);

        \Log::info('Activity Category Updated Successfully', [
            'category_id' => $activityCategory->id,
            'updated_data' => $activityCategory->fresh()->toArray()
        ]);

        return redirect()->route('activity-categories.index')
            ->with('success', 'Activity category updated successfully.');
    }

    /**
     * Show the form for importing categories from Excel/CSV
     */
    public function importForm()
    {
        return inertia('ActivityCategories/Import', [
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Import categories from Excel/CSV file
     */
    public function import(Request $request)
    {
        \Log::info('ActivityCategoryController: import called');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        try {
            // $import = new ActivityCategoryImport();
            $import = new ActivityCatImport();
            Excel::import($import, $request->file('file'));

            // $errors = $import->getErrors();
            // $imported = $import->getImported();

            // if (!empty($errors)) {
            //     $errorMessage = "Import completed with " . count($errors) . " errors:\n" . implode("\n", array_slice($errors, 0, 10));
            //     if (count($errors) > 10) {
            //         $errorMessage .= "\n... and " . (count($errors) - 10) . " more errors";
            //     }

            //     return redirect()->route('activity-categories.import.form')
            //         ->with('error', $errorMessage)
            //         ->with('imported_count', count($imported));
            // }

            // return redirect()->route('activity-categories.index')
            //     ->with('success', 'Import completed successfully! Imported ' . count($imported) . ' items.');
            return redirect()->route('activity-categories.index')
                ->with('success', 'Import completed successfully!');

        } catch (\Exception $e) {
            return redirect()->route('activity-categories.import.form')
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Download sample import template
     */
    public function downloadTemplate()
    {
        // Try Excel template first, fallback to CSV if needed
        try {
            return Excel::download(new \App\Exports\ActivityCategoryTemplateExport(), 'activity_categories_template.xlsx');
        } catch (\Exception $e) {
            // Fallback to CSV template if Excel export fails
            return $this->downloadCsvTemplate();
        }
    }

    /**
     * Fallback CSV template download
     */
    private function downloadCsvTemplate()
    {
        $fileName = 'activity_categories_import_template.csv';

        $sampleData = [
            ['category_name', 'category_code', 'category_description', 'standard_time', 'parent_category_code', 'role_names', 'department_name'],
            ['Project Management', '', 'Managing project activities', 120, '', 'Project Manager,Team Lead', 'IT Department'],
            ['Planning', '', 'Project planning activities', 60, '', 'Project Manager,Planner', 'IT Department'],
            ['Quality Assurance', '', 'Quality control activities', 45, '', 'QA Manager,QA Specialist', 'Quality Department'],
            ['Testing', '', 'Software testing activities', 30, '', 'Tester,Automation Engineer', 'Quality Department'],
            ['Documentation', '', 'Documentation activities', 60, '', 'Technical Writer', 'Documentation Department'],
            ['Your Category Name', '', 'Your description here', 90, '', 'Your Roles', 'Your Department'],
        ];

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'no-cache, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        return response()->stream(function() use ($sampleData) {
            $handle = fopen('php://output', 'w');

            // Add BOM for proper UTF-8 encoding in Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            foreach ($sampleData as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ActivityCategory $activityCategory)
    {
        // Prevent deletion if referenced by activities
        if ($activityCategory->activities()->count() > 0) {
            return redirect()->route('activity-categories.index')
                ->with('error', 'Cannot delete category. It is associated with activities.');
        }

        $activityCategory->delete();

        return redirect()->route('activity-categories.index')
            ->with('success', 'Activity category deleted successfully.');
    }

    /**
     * Preview the auto-generated code based on form inputs
     */
    public function previewCode(Request $request)
    {
        try {
            // Create a temporary category object for code generation
            $tempCategory = new ActivityCategory();
            $tempCategory->name = $request->input('name', '');
            $tempCategory->department_id = $request->input('department_id');
            $tempCategory->parent_id = $request->input('parent_id');

            // Handle department_name for import preview
            if (!$tempCategory->department_id && $request->input('department_name')) {
                $department = Department::where('name', trim($request->input('department_name')))->first();
                if ($tempCategory->department_id = $department->id ?? null) {
                    // Department found, use it
                } else {
                    // For preview purposes, create a temporary department object
                    $shortName = strtoupper(substr(trim($request->input('department_name')), 0, 3));
                    $tempCategory->department = (object) ['short_name' => $shortName];
                }
            }

            // If parent_id is provided, get parent category for preview
            if ($tempCategory->parent_id) {
                $parentCategory = ActivityCategory::find($tempCategory->parent_id);
                if (!$parentCategory) {
                    return response()->json([
                        'code' => '',
                        'error' => 'Parent category not found',
                        'success' => false
                    ]);
                }

                // For sub-categories, ensure we have department info from parent if not set
                if (!$tempCategory->department_id && $parentCategory->department_id) {
                    $tempCategory->department_id = $parentCategory->department_id;
                }
            }

            // Generate code preview
            $previewCode = '';
            if ($tempCategory->name) {
                $previewCode = ActivityCategory::generateUniqueCode($tempCategory);
            }

            return response()->json([
                'code' => $previewCode,
                'success' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Code preview generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'inputs' => $request->all()
            ]);

            return response()->json([
                'code' => '',
                'success' => false,
                'error' => 'Failed to generate code preview: ' . $e->getMessage()
            ], 500);
        }
    }
}
