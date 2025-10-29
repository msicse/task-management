<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\WorkRole;

class DemonstrateMultipleWorkRoles extends Command
{
    protected $signature = 'demo:multiple-work-roles {user_id}';
    protected $description = 'Demonstrate how multiple work roles work for a user';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found!");
            return 1;
        }

        $this->info("=== Multiple Work Roles Demo for: {$user->name} ===");
        $this->newLine();

        // Show current work roles
        $currentRoles = $user->workRoles;
        $this->info("Current Work Roles ({$currentRoles->count()}):");
        foreach ($currentRoles as $role) {
            $this->line("  • {$role->name} (ID: {$role->id})");
        }
        $this->newLine();

        // Show available work roles
        $availableRoles = WorkRole::all();
        $this->info("Available Work Roles:");
        foreach ($availableRoles as $role) {
            $assigned = $currentRoles->contains('id', $role->id) ? '✓' : '○';
            $this->line("  {$assigned} {$role->name} (ID: {$role->id})");
        }
        $this->newLine();

        // Show categories accessible through work roles
        $categories = $user->getWorkRoleCategories();
        $this->info("Activity Categories Accessible ({$categories->count()}):");
        foreach ($categories as $category) {
            $this->line("  • {$category->name} (ID: {$category->id})");
        }
        $this->newLine();

        // Demonstrate assignment methods
        $this->info("=== Assignment Methods ===");
        $this->line("1. Assign single work role:");
        $this->line("   \$user->workRoles()->attach([role_id]);");
        $this->newLine();

        $this->line("2. Assign multiple work roles:");
        $this->line("   \$user->workRoles()->attach([1, 2, 3]);");
        $this->newLine();

        $this->line("3. Replace all work roles (sync):");
        $this->line("   \$user->workRoles()->sync([1, 2, 3]);");
        $this->newLine();

        $this->line("4. Remove work roles:");
        $this->line("   \$user->workRoles()->detach([1, 2]);");
        $this->newLine();

        $this->line("5. Check if user has access to category:");
        $this->line("   \$user->isAssignedToCategory(\$categoryId);");
        $this->newLine();

        return 0;
    }
}
