<?php

namespace App\Imports;

use App\Models\User;
use App\Models\WorkRole;
use Illuminate\Support\Str;
use App\Models\ActivityCategory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UserActivityRolesImport implements ToCollection, WithHeadingRow
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function collection(\Illuminate\Support\Collection $rows)
    {
        foreach ($rows as $row) {
            // Process each row here
            $employee_id = trim($row['employee_id']);
            $email = trim($row['email']);
            $roleName = trim($row['role_name']);
            $subCategoryCodes = trim($row['sub_category_codes']);

            if (!$email || !$roleName) {
                continue;
            }

            // Find user by employee_id or email
            $user = User::where('employee_id', $employee_id)
                ->orWhere('email', $email)
                ->first();

            if (!$user) {
                continue;
            }

            $slug = Str::slug($roleName);

            $role = WorkRole::firstOrCreate(
                ['short_name' => $roleName],
                [
                    'name' => $roleName,
                    'slug' => $slug,
                    'is_active' => 1,
                ]
            );

            $user->workRoles()->syncWithoutDetaching([$role->id]);


            if (!empty($subCategoryCodes)) {
                $codes = array_map('trim', explode(',', $subCategoryCodes));
                $categoryIds = ActivityCategory::whereIn('code', $codes)->pluck('id')->toArray();

                if (!empty($categoryIds)) {
                    $role->activityCategories()->syncWithoutDetaching($categoryIds);
                }
            }
        }
    }
}
