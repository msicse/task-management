<?php

namespace App\Imports;

use App\Models\WorkRole;
use Illuminate\Support\Str;
use App\Models\ActivityCategory;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ActivityCatImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Trim values
            $parentCode = trim($row['parent_category_code'] ?? '');
            $code       = trim($row['code'] ?? '');
            $name       = trim($row['name'] ?? '');
            $definition = $row['definition'] ?? null;
            $reference_protocol = $row['reference_protocol'] ?? null;
            $objective = $row['objective'] ?? null;
            $standard_time = $row['standard_time'] ?? null;
            // $rolesStr   = $row['roles'] ?? null;

            // Find parent if parent_code is provided
            $parentId = null;
            if ($parentCode) {
                $parent = ActivityCategory::where('code', $parentCode)->first();
                if ($parent) {
                    $parentId = $parent->id;
                }
            }


            // Create or update the category/subcategory
           $category = ActivityCategory::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'parent_id' => $parentId,
                    'definition' => $definition,
                    'reference_protocol' => $reference_protocol,
                    'objective' => $objective,
                    'standard_time' => $standard_time,
                ]
            );


            //  // 3️ Process roles (comma-separated)
            // if (!empty($rolesStr)) {
            //     $roleNames = array_map('trim', explode(',', $rolesStr));
            //     $roleIds = [];

            //     foreach ($roleNames as $roleName) {
            //         if ($roleName === '') continue;

            //         // Generate  slug
            //         $slug = Str::slug($roleName);
            //         // Create or find existing role
            //         $role = WorkRole::firstOrCreate(
            //             ['name' => $roleName],
            //             [
            //                 'short_name' => $roleName,
            //                 'slug' => $slug,
            //                 'is_active' => 1,
            //             ]
            //         );

            //         $roleIds[] = $role->id;
            //     }

            //     //  Attach pivot (no duplicates)
            //     $category->workRoles()->syncWithoutDetaching($roleIds);
            // }
        }
    }
}
