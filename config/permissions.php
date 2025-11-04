<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Permissions - SINGLE SOURCE OF TRUTH
    |--------------------------------------------------------------------------
    |
    | ⭐ THIS IS THE ONLY PLACE TO MANAGE PERMISSIONS ⭐
    |
    | When you add a new feature that needs a permission:
    |
    | 1. Add the permission name to the 'permissions' array below
    | 2. Add it to appropriate roles in 'role_permissions' section
    | 3. Run: php artisan db:seed --class=PermissionsSeeder
    | 4. Verify: php artisan permission:show
    |
    | Example - Adding a new permission:
    | ----------------------------------
    | 'permissions' => [
    |     'activity-create-manual',  // ← Add new permission here
    | ],
    |
    | 'role_permissions' => [
    |     'Manager' => [
    |         'activity-create-manual',  // ← Then add to role(s)
    |     ],
    | ],
    |
    */

    'permissions' => [
        // =====================================================================
        // TASK PERMISSIONS
        // =====================================================================
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

        // =====================================================================
        // ACTIVITY PERMISSIONS
        // =====================================================================
        'activity-list',          // View own activities
        'activity-list-all',      // View all team activities
        'activity-import',        // Import activities
        'activity-category-import', // Import activity categories
        'activity-create',        // Create new activities (timer-based)
        'activity-create-manual', // Create manual activities (with custom date/time)
        'activity-edit',          // Edit activities
        'activity-delete',        // Delete activities
        'activity-view',          // View activity details
        'activity-reports',       // View activity reports
        'activity-export',        // Export activities

        // =====================================================================
        // USER MANAGEMENT PERMISSIONS
        // =====================================================================
        'user-list',
        'user-create',
        'user-edit',
        'user-delete',

        // =====================================================================
        // ROLE MANAGEMENT PERMISSIONS
        // =====================================================================
        'role-list',
        'role-create',
        'role-edit',
        'role-delete',
        'work-role-import',

        // =====================================================================
        // CATEGORY PERMISSIONS
        // =====================================================================
        'category-list',
        'category-create',
        'category-edit',
        'category-delete',

        // =====================================================================
        // DEPARTMENT PERMISSIONS
        // =====================================================================
        'department-list',
        'department-create',
        'department-edit',
        'department-delete',

        // =====================================================================
        // PROJECT PERMISSIONS
        // =====================================================================
        'project-list',
        'project-create',
        'project-edit',
        'project-delete',
        'project-view',

        // =====================================================================
        // SCORING PERMISSIONS
        // =====================================================================
        'assignee-score-create',
        'assignor-score-create',
        'score-view',

        // =====================================================================
        // FILE PERMISSIONS
        // =====================================================================
        'file-upload',
        'file-download',
        'file-delete',

        // =====================================================================
        // REPORTING PERMISSIONS
        // =====================================================================
        'report-dashboard',
        'report-export',
        'report-view',
    ],

    /*
    |--------------------------------------------------------------------------
    | Role Permission Mappings
    |--------------------------------------------------------------------------
    |
    | Define which permissions each role should have. When you add a new
    | permission above, add it to the appropriate roles below.
    |
    */

    'role_permissions' => [
        'Admin' => 'all', // Admin gets all permissions

        'Manager' => [
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

            // Activity related
            'activity-list',
            'activity-list-all',
            'activity-create',
            'activity-create-manual',
            'activity-view',
            'activity-reports',
            'activity-export',

            // Others
            'project-list',
            'project-view',
            'report-view',
            'file-upload',
            'file-download',
            'score-view',
            'assignee-score-create',
            'assignor-score-create',
        ],

        'Team Leader' => [
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

            // Activity related
            'activity-list',
            'activity-list-all',
            'activity-create',
            'activity-create-manual',
            'activity-view',
            'activity-reports',
            'activity-export',

            'project-list',
            'project-view',
            'file-upload',
            'file-download',
            'score-view',
            'assignee-score-create',
            'assignor-score-create',
        ],

        'Employee' => [
            'task-list',
            'task-create',
            'task-view',
            'task-view-own',
            'task-approve',
            'task-update-own',
            'task-complete',
            'task-comment',

            // Activity permissions
            'activity-list',
            'activity-create',
            'activity-view',

            'file-upload',
            'file-download',
            'assignee-score-create',
            'assignor-score-create',
        ],
    ],
];
