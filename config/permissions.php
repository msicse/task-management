<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Permissions
    |--------------------------------------------------------------------------
    |
    | Keep a single authoritative list of permissions here. When you add a new
    | feature that needs a permission, add the permission name to this list.
    | The seeder `PermissionsSeeder` will read from this config and create
    | any missing permissions in a safe, idempotent way.
    |
    */

    'permissions' => [
        // Activities
        'activity.view',
        'activity.create',
        'activity.edit',
        'activity.delete',
        'activity.complete',
        'activity.import',

        // Activity Categories
        'activity-category.view',
        'activity-category.create',
        'activity-category.edit',
        'activity-category.delete',
        'activity-category.import',

        // Work roles (example)
        'work-role.view',
        'work-role.create',
        'work-role.edit',
        'work-role.delete',
        'work-role.import',

        // Tasks (examples)
        'task.view',
        'task.create',
        'task.edit',
        'task.delete',

        // Import/export
        'export.activities',
        'export.tasks',

        // Add additional permissions here as features are developed
    ],
];
