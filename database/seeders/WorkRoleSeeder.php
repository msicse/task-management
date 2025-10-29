<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkRoleSeeder extends Seeder
{
    public function run(): void
    {
        $workRoles = [
            [
                'name' => 'Officer Inspection Scheduling',
                'description' => 'Handles inspection scheduling, confirmation and coordination activities',
                'is_active' => true,
            ],
            [
                'name' => 'Remediation Programme Officer',
                'description' => 'Manages remediation activities, CAP follow-ups and boiler inspections',
                'is_active' => true,
            ],
            [
                'name' => 'Senior Deputy Manager',
                'description' => 'Oversees operations, manages teams and strategic planning',
                'is_active' => true,
            ],
            [
                'name' => 'Senior Head of Department',
                'description' => 'Department leadership, decision making and stakeholder management',
                'is_active' => true,
            ],
            [
                'name' => 'Senior Officer Inspection Scheduling',
                'description' => 'Senior level inspection scheduling and team coordination',
                'is_active' => true,
            ],
            [
                'name' => 'Senior Remediation Programme Officer',
                'description' => 'Senior level remediation management and complex case handling',
                'is_active' => true,
            ],
            [
                'name' => 'Team Leader',
                'description' => 'Team coordination, task assignment and performance management',
                'is_active' => true,
            ],
            [
                'name' => 'Finance Officer',
                'description' => 'Financial planning, budget management and finance protocol oversight',
                'is_active' => true,
            ],
            [
                'name' => 'Training Coordinator',
                'description' => 'Training program management and capacity building activities',
                'is_active' => true,
            ],
            [
                'name' => 'Stakeholder Engagement Officer',
                'description' => 'Brand and factory engagement, industry coordination',
                'is_active' => true,
            ],
            [
                'name' => 'Escalation Case Manager',
                'description' => 'Escalation process management and case resolution',
                'is_active' => true,
            ],
        ];

        $this->command->info('Creating work roles...');

        foreach ($workRoles as $roleData) {
            $workRole = \App\Models\WorkRole::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );

            if ($workRole->wasRecentlyCreated) {
                $this->command->info("✅ Created: {$roleData['name']}");
            } else {
                $this->command->info("⚪ Exists: {$roleData['name']}");
            }
        }

        $this->command->info("\n📊 Work Roles Summary:");
        $this->command->info("- Total Work Roles: " . \App\Models\WorkRole::count());
        $this->command->info("- Active Work Roles: " . \App\Models\WorkRole::where('is_active', true)->count());

        $this->command->info("\n✅ Work roles created successfully!");
        $this->command->info("💡 Next: You can now assign activity categories to these work roles through the UI.");
    }
}
