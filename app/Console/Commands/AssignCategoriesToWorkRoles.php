<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\WorkRole;
use App\Models\ActivityCategory;

class AssignCategoriesToWorkRoles extends Command
{
    protected $signature = 'fix:work-role-categories';
    protected $description = 'Assign activity categories to work roles that dont have any';

    public function handle()
    {
        $this->info("Assigning categories to work roles...");

        $workRoles = WorkRole::with('activityCategories')->get();
        $categories = ActivityCategory::all();

        if ($categories->isEmpty()) {
            $this->error("No activity categories found!");
            return 1;
        }

        $categoriesPerRole = max(1, intval($categories->count() / $workRoles->count()));
        $this->info("Will assign approximately {$categoriesPerRole} categories per role");

        foreach ($workRoles as $index => $workRole) {
            $currentCategoriesCount = $workRole->activityCategories->count();

            if ($currentCategoriesCount > 0) {
                $this->line("  {$workRole->name}: Already has {$currentCategoriesCount} categories - SKIPPING");
                continue;
            }

            // Assign some categories to this work role
            $startIndex = $index * $categoriesPerRole;
            $categoriesToAssign = $categories->slice($startIndex, $categoriesPerRole);

            if ($categoriesToAssign->isEmpty()) {
                // If we ran out of categories, assign some random ones
                $categoriesToAssign = $categories->random(min(5, $categories->count()));
            }

            $categoryIds = $categoriesToAssign->pluck('id')->toArray();
            $workRole->activityCategories()->sync($categoryIds);

            $this->line("  {$workRole->name}: Assigned {$categoriesToAssign->count()} categories");
        }

        // Show final status
        $this->info("\nFinal work role status:");
        foreach ($workRoles as $workRole) {
            $workRole->refresh();
            $count = $workRole->activityCategories->count();
            $this->line("  • {$workRole->name}: {$count} categories");
        }

        $this->info("Categories assignment completed!");
        return 0;
    }
}
