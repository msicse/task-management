<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\WorkRole;
use App\Models\ActivityCategory;

class FixWorkRoleAssignments extends Command
{
    protected $signature = 'fix:work-role-assignments {user_id?}';
    protected $description = 'Fix work role assignments for a user or all users';

    public function handle()
    {
        $userId = $this->argument('user_id');

        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found!");
                return 1;
            }
            $this->fixUserWorkRoles($user);
        } else {
            // Show available users to choose from
            $users = User::take(10)->get(['id', 'name', 'email']);
            $this->info("Available users:");
            foreach ($users as $user) {
                $this->line("  {$user->id}: {$user->name} ({$user->email})");
            }

            $userId = $this->ask('Enter user ID to fix work roles for');
            $user = User::find($userId);

            if (!$user) {
                $this->error("User with ID {$userId} not found!");
                return 1;
            }

            $this->fixUserWorkRoles($user);
        }

        return 0;
    }

    private function fixUserWorkRoles(User $user)
    {
        $this->info("Fixing work roles for: {$user->name} ({$user->email})");

        // Show current assignments
        $currentRoles = $user->workRoles;
        $this->info("Current work roles: " . $currentRoles->count());
        foreach ($currentRoles as $role) {
            $this->line("  • {$role->name} (Categories: {$role->activityCategories->count()})");
        }

        // Show available work roles
        $workRoles = WorkRole::with('activityCategories')->get();
        $this->info("\nAvailable work roles:");
        foreach ($workRoles as $role) {
            $this->line("  {$role->id}: {$role->name} (Categories: {$role->activityCategories->count()})");
        }

        // Ask which roles to assign
        $selectedRoles = $this->ask('Enter work role IDs to assign (comma-separated, or "all" for all roles)');

        if ($selectedRoles === 'all') {
            $roleIds = $workRoles->pluck('id')->toArray();
        } else {
            $roleIds = array_map('trim', explode(',', $selectedRoles));
            $roleIds = array_filter($roleIds, 'is_numeric');
        }

        // Assign the roles
        $user->workRoles()->sync($roleIds);

        // Show results
        $assignedRoles = WorkRole::whereIn('id', $roleIds)->get();
        $this->info("\nAssigned work roles:");
        foreach ($assignedRoles as $role) {
            $this->line("  • {$role->name} (Categories: {$role->activityCategories->count()})");
        }

        // Test category access
        $categories = $user->getWorkRoleCategories();
        $this->info("\nUser can now access {$categories->count()} activity categories:");
        foreach ($categories->take(5) as $category) {
            $this->line("  • {$category->name}");
        }

        if ($categories->count() > 5) {
            $this->line("  ... and " . ($categories->count() - 5) . " more");
        }

        $this->info("Work roles updated successfully!");
    }
}
