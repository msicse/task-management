<?php

namespace App\Imports;

use App\Models\Task;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class TaskImport implements ToCollection, WithHeadingRow, WithValidation
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Look up the category by name
            $categoryId = null;
            if (!empty($row['category'])) {
                $category = Category::where('name', $row['category'])->first();
                $categoryId = $category ? $category->id : null;
            }

            // Look up the assigned user by name or email
            $assignedUserId = null;
            if (!empty($row['assigned_user'])) {
                $user = User::where('name', $row['assigned_user'])
                    ->orWhere('email', $row['assigned_user'])
                    ->first();
                $assignedUserId = $user ? $user->id : null;
            }

            // Create task with required fields or skip if missing
            if (empty($row['name']) || empty($categoryId) || empty($assignedUserId)) {
                continue;
            }

            Task::create([
                'name' => $row['name'],
                'description' => $row['description'] ?? '',
                'status' => $row['status'] ?? 'pending',
                'priority' => $row['priority'] ?? 'medium',
                'due_date' => $row['due_date'] ?? now()->addDays(7),
                'factory_id' => $row['factory_id'] ?? null,
                'category_id' => $categoryId,
                'assigned_user_id' => $assignedUserId,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
                'slug' => Str::slug($row['name'])
            ]);
        }
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed',
            'priority' => 'nullable|in:low,medium,high',
        ];
    }
}
