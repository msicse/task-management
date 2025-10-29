<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ActivityCategory;

class SetupRoleCategories extends Command
{
    protected $signature = 'activities:setup-role-categories';
    protected $description = 'Setup activity categories based on role requirements';

    public function handle()
    {
        $requiredCategories = [
            [
                'name' => 'Overseeing Inspection confirmation (Inspection Scheduling)',
                'description' => 'Tasks related to overseeing and confirming inspection scheduling activities'
            ],
            [
                'name' => 'Phone Calls (Inspection Scheduling)',
                'description' => 'Phone call activities for inspection scheduling coordination'
            ],
            [
                'name' => 'Boiler CAP fill up',
                'description' => 'Corrective Action Plan documentation and completion for boiler inspections'
            ],
            [
                'name' => 'Boiler Immediate Issue Follow Up',
                'description' => 'Follow-up activities for immediate boiler inspection issues'
            ]
        ];

        $this->info('Setting up role-based activity categories...');

        foreach ($requiredCategories as $categoryData) {
            $category = ActivityCategory::firstOrCreate(
                ['name' => $categoryData['name']],
                ['description' => $categoryData['description']]
            );

            $action = $category->wasRecentlyCreated ? 'Created' : 'Found existing';
            $this->info("✓ {$action} category: {$categoryData['name']}");
        }

        $this->info('');
        $this->info('Role-based activity categories setup completed!');
        $this->info('You can now manage role-category assignments at: /admin/role-categories');

        return Command::SUCCESS;
    }
}
