<?php

namespace App\Imports;

use App\Models\ActivityCategory;
use App\Models\WorkRole;
use App\Models\Department;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ActivityCategoryImport implements ToCollection, WithHeadingRow, WithValidation
{
    private array $errors = [];
    private array $imported = [];
    private array $categoryMapping = [];

    public function collection(Collection $rows): void
    {
        DB::beginTransaction();

        try {
            $this->processCategories($rows);
            $this->processParentRelationships($rows);
            $this->processRoleAssignments($rows);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    private function processCategories(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            if (!$row->get('category_name')) continue;

            $category = $this->createOrUpdateCategory($row, $index);
            if ($category) {
                // Store mapping by both code and name for flexible lookup
                $this->categoryMapping[$category->code] = $category;
                $this->categoryMapping[$category->name] = $category;
            }
        }
    }

    private function processParentRelationships(Collection $rows): void
    {
        foreach ($rows as $row) {
            if (!$row->get('category_name') || !$row->get('parent_category_code')) continue;

            $parent = $this->categoryMapping[$row->get('parent_category_code')] ?? null;
            $child = $this->categoryMapping[$row->get('category_code') ?: $row->get('category_name')] ?? null;

            if ($parent && $child) {
                $child->update(['parent_id' => $parent->id]);
            }
        }
    }

    private function processRoleAssignments(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            if (!$row->get('category_name') || !$row->get('role_names')) continue;

            $this->assignRolesToCategory($row, $index);
        }
    }

    private function createOrUpdateCategory(Collection $row, int $index): ?ActivityCategory
    {
        try {
            $action = strtoupper(trim($row->get('action')));

            // Validate action
            if (!in_array($action, ['CREATE', 'UPDATE'])) {
                $this->errors[] = "Row " . ($index + 2) . ": Invalid action '{$row->get('action')}'. Must be CREATE or UPDATE.";
                return null;
            }

            // Get or create department if specified
            $departmentId = null;
            if ($row->get('department_name')) {
                $department = Department::firstOrCreate(
                    ['name' => trim($row->get('department_name'))],
                    ['short_name' => strtoupper(substr(trim($row->get('department_name')), 0, 3))]
                );
                $departmentId = $department->id;

                if ($department->wasRecentlyCreated) {
                    $this->imported[] = "Created department: {$department->name}";
                }
            }

            $data = array_filter([
                'name' => $row->get('category_name'),
                'definition' => $row->get('category_description'),
                'standard_time' => $row->get('standard_time') ? (int) $row->get('standard_time') : null,
                'department_id' => $departmentId,
                'reference_protocol' => $row->get('reference_protocol'),
                'objective' => $row->get('objective'),
            ], fn($value) => !empty($value));

            if ($action === 'CREATE') {
                // For CREATE action, check if category already exists
                $existingByName = ActivityCategory::where('name', $data['name'])->first();
                $existingByCode = $row->get('category_code') ?
                    ActivityCategory::where('code', $row->get('category_code'))->first() : null;

                if ($existingByName || $existingByCode) {
                    $this->errors[] = "Row " . ($index + 2) . ": Category '{$data['name']}' already exists. Use UPDATE action to modify existing categories.";
                    return null;
                }

                // Don't set code for CREATE - let the model generate it
                $category = ActivityCategory::create($data);
                $this->imported[] = "Created: {$category->name} ({$category->code})";

            } else { // UPDATE action
                // For UPDATE action, find existing category by code
                $existingCode = trim($row->get('category_code'));
                if (empty($existingCode)) {
                    $this->errors[] = "Row " . ($index + 2) . ": UPDATE action requires existing category_code.";
                    return null;
                }

                $category = ActivityCategory::where('code', $existingCode)->first();
                if (!$category) {
                    $this->errors[] = "Row " . ($index + 2) . ": Category with code '{$existingCode}' not found for update.";
                    return null;
                }

                // Update the category
                $category->update($data);
                $this->imported[] = "Updated: {$category->name} ({$category->code})";
            }

            return $category;
        } catch (\Exception $e) {
            $this->errors[] = "Row " . ($index + 2) . ": {$e->getMessage()}";
            return null;
        }
    }

    private function assignRolesToCategory(Collection $row, int $index): void
    {
        try {
            // Try to find category by code first, then by name
            $category = $this->categoryMapping[$row->get('category_code')] ??
                       $this->categoryMapping[$row->get('category_name')] ?? null;
            if (!$category) return;

            $roleIds = collect(explode(',', $row->get('role_names')))
                ->map(fn($name) => trim($name))
                ->filter()
                ->map(fn($name) => $this->getOrCreateRole($name))
                ->toArray();

            if ($roleIds) {
                $category->workRoles()->syncWithoutDetaching($roleIds);
                $this->imported[] = "Roles assigned to: {$category->name}";
            }
        } catch (\Exception $e) {
            $this->errors[] = "Row " . ($index + 2) . ": Role assignment failed - {$e->getMessage()}";
        }
    }

    private function getOrCreateRole(string $name): int
    {
        $role = WorkRole::firstOrCreate(
            ['name' => $name],
            ['description' => "Auto-created: {$name}"]
        );

        if ($role->wasRecentlyCreated) {
            $this->imported[] = "Created role: {$name}";
        }

        return $role->id;
    }

    public function rules(): array
    {
        return [
            'action' => 'required|string|in:CREATE,UPDATE,create,update',
            'category_name' => 'required|string|max:255',
            'category_code' => 'nullable|string|max:50',
            'category_description' => 'nullable|string|max:1000',
            'standard_time' => 'nullable|integer|min:1|max:1440',
            'parent_category_code' => 'nullable|string|max:50',
            'role_names' => 'nullable|string',
            'department_name' => 'nullable|string|max:255',
            'reference_protocol' => 'nullable|string|max:255',
            'objective' => 'nullable|string|max:1000',
        ];
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getImported(): array
    {
        return $this->imported;
    }
}
