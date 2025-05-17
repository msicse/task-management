<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CompletePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for tasks
        $taskPermissions = [
            'task-list',          // View all tasks
            'task-create',        // Create new tasks
            'task-edit',          // Edit any task
            'task-delete',        // Delete any task
            'task-view',          // View any task details
            'task-assign',        // Assign tasks to other users
            'task-view-own',      // View own tasks
            'task-update-own',    // Update own tasks
            'task-complete',      // Mark tasks as complete
            'task-approve',       // Approve completed tasks
            'task-import',        // Import tasks
            'task-export',        // Export tasks
            'task-reports',       // View task reports
            'task-generate-pdf',  // Generate PDF for tasks
            'task-comment',       // Comment on tasks
        ];

        // User management permissions
        $userPermissions = [
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',
        ];

        // Role management permissions
        $rolePermissions = [
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
        ];

        // Category permissions
        $categoryPermissions = [
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',
        ];

        // Department permissions
        $departmentPermissions = [
            'department-list',
            'department-create',
            'department-edit',
            'department-delete',
        ];

        // Project permissions
        $projectPermissions = [
            'project-list',
            'project-create',
            'project-edit',
            'project-delete',
            'project-view',
        ];

        // Scoring permissions
        $scorePermissions = [
            'assignee-score-create',
            'assignor-score-create',
            'score-view',
        ];

        // File permissions
        $filePermissions = [
            'file-upload',
            'file-download',
            'file-delete',
        ];

        // Reporting permissions
        $reportingPermissions = [
            'report-dashboard',
            'report-export',
            'report-view',
        ];

        // Merge all permissions
        $allPermissions = array_merge(
            $taskPermissions,
            $userPermissions,
            $rolePermissions,
            $categoryPermissions,
            $departmentPermissions,
            $projectPermissions,
            $scorePermissions,
            $filePermissions,
            $reportingPermissions
        );

        // Create permissions in DB
        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        // Create roles with permissions

        // Admin role - all permissions
        Role::where('name', 'global-admin')->first() ?: Role::create(['name' => 'global-admin']);
        $adminRole = Role::where('name', 'Admin')->first() ?: Role::create(['name' => 'Admin']);
        $adminRole->syncPermissions($allPermissions);

        // Manager role - can manage tasks, approve completions, assign tasks, view all
        $managerRole = Role::where('name', 'Manager')->first() ?: Role::create(['name' => 'Manager']);
        $managerRole->syncPermissions([
            // Task related
            'task-list',
            'task-create',
            'task-edit',
            'task-view',
            'task-assign',
            'task-approve',
            'task-view-own',
            'task-update-own',
            'task-complete',
            'task-comment',
            'task-reports',
            'task-export',
            'task-generate-pdf',

            // Others
            'project-list',
            'project-view',
            'report-view',
            'file-upload',
            'file-download',
            'score-view',
            'assignee-score-create',
            'assignor-score-create',
        ]);
        // Team Leader role - can assign tasks to team, approve team's tasks
        $teamLeaderRole = Role::where('name', 'Team Leader')->first() ?: Role::create(['name' => 'Team Leader']);
        $teamLeaderRole->syncPermissions([
            'task-list',
            'task-create',
            'task-view',
            'task-edit',
            'task-assign',
            'task-approve',
            'task-view-own',
            'task-update-own',
            'task-complete',
            'task-comment',
            'task-reports',
            'project-list',
            'project-view',
            'file-upload',
            'file-download',
            'score-view',
            'assignee-score-create',
            'assignor-score-create',
        ]);
        // Employee role - can view assigned tasks, mark as complete
        $employeeRole = Role::where('name', 'Employee')->first() ?: Role::create(['name' => 'Employee']);
        $employeeRole->syncPermissions([
            'task-list',
            'task-create',
            'task-view',
            'task-view-own',
            'task-approve',
            'task-update-own',
            'task-complete',
            'task-comment',
            'file-upload',
            'file-download',
            'assignee-score-create',
            'assignor-score-create',
        ]);
        // Create a super-admin user (if one doesn't exist)
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (!$adminUser) {
            $adminUser = User::factory()->create([
                'department_id' => 1,
                'name' => 'Admin User',
                'designation' => 'IT Professional',
                'employee_id' => 2645,
                'phone' => '1111111111',
                'email' => 'admin@example.com',
                'date_of_join' => '2020-12-12',
                'password' => bcrypt(12345678),
                'email_verified_at' => time(),
            ]);
        }

        // Make sure the admin user has the Admin role
        $adminUser->syncRoles([$adminRole]);


        // Create a super-admin user (if one doesn't exist)
        $employeeUser = User::where('email', 'user@example.com')->first();

        if (!$employeeUser) {
            $employeeUser = User::factory()->create([
                'department_id' => 1,
                'name' => 'General User',
                'designation' => 'IT Professional',
                'employee_id' => 2646,
                'phone' => '99999999999',
                'email' => 'user@example.com',
                'date_of_join' => '2020-12-12',
                'password' => bcrypt(12345678),
                'email_verified_at' => time(),
            ]);
        }

         // Make sure the admin user has the Admin role
        $employeeUser->syncRoles([$employeeRole]);
    }
}
