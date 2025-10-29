<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\ActivityCategory;

class TestRoleCategories extends Command
{
    protected $signature = 'test:role-categories';
    protected $description = 'Test role-category relationships';

    public function handle()
    {
        $this->info('Testing Role-Category Database Relationships...');

        // Get a role and show its categories
        $role = \App\Models\Role::with('activityCategories')->first();
        if ($role) {
            $this->info("Role: {$role->name}");
            $this->info("Categories: " . $role->activityCategories->pluck('name')->join(', '));
        }

        // Get a category and show its roles
        $category = ActivityCategory::with('roles')->first();
        if ($category) {
            $this->info("Category: {$category->name}");
            $this->info("Roles: " . $category->roles->pluck('name')->join(', '));
        }

        // Test user's applicable categories
        $user = \App\Models\User::with('roles')->first();
        if ($user) {
            $this->info("User: {$user->name}");
            $this->info("User Roles: " . $user->roles->pluck('name')->join(', '));

            $applicableCategories = $user->getApplicableActivityCategories();
            $this->info("Applicable Categories: " . $applicableCategories->pluck('name')->join(', '));
        }

        return Command::SUCCESS;
    }
}
