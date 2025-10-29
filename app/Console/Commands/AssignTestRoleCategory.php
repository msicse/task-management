<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use App\Models\ActivityCategory;

class AssignTestRoleCategory extends Command
{
    protected $signature = 'assign:test-role-category';
    protected $description = 'Assign a test category to a role to verify the system works';

    public function handle()
    {
        $this->info('Testing Role-Category Assignment...');

        // Find or create a test role
        $role = Role::firstOrCreate(['name' => 'Officer Inspection Scheduling', 'guard_name' => 'web']);
        $category = ActivityCategory::where('name', 'Phone Calls (Inspection Scheduling)')->first();

        if (!$category) {
            $this->error('Category not found. Run the seeder first.');
            return Command::FAILURE;
        }

        // Check if assignment already exists
        $exists = \DB::table('activity_category_role')
            ->where('role_id', $role->id)
            ->where('activity_category_id', $category->id)
            ->exists();

        if ($exists) {
            $this->info("Assignment already exists: {$role->name} -> {$category->name}");
        } else {
            // Create assignment
            \DB::table('activity_category_role')->insert([
                'role_id' => $role->id,
                'activity_category_id' => $category->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->info("Created assignment: {$role->name} -> {$category->name}");
        }

        // Test user access
        $user = \App\Models\User::with('roles')->first();
        if ($user) {
            $this->info("Testing user: {$user->name}");
            $categories = $user->getApplicableActivityCategories();
            $this->info("User's accessible categories: " . $categories->pluck('name')->join(', '));
        }

        return Command::SUCCESS;
    }
}
