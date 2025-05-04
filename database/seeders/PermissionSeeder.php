<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Task permissions
        Permission::create(['name' => 'task-list']);
        Permission::create(['name' => 'task-create']);
        Permission::create(['name' => 'task-edit']);
        Permission::create(['name' => 'task-delete']);
        Permission::create(['name' => 'task-view']);
        Permission::create(['name' => 'task-view-own']);

        // Category permissions
        Permission::create(['name' => 'category-list']);
        Permission::create(['name' => 'category-create']);
        Permission::create(['name' => 'category-edit']);
        Permission::create(['name' => 'category-delete']);
        Permission::create(['name' => 'category-view']);

        // Department permissions
        Permission::create(['name' => 'department-list']);
        Permission::create(['name' => 'department-create']);
        Permission::create(['name' => 'department-edit']);
        Permission::create(['name' => 'department-delete']);
        Permission::create(['name' => 'department-view']);

        // Project permissions
        Permission::create(['name' => 'project-list']);
        Permission::create(['name' => 'project-create']);
        Permission::create(['name' => 'project-edit']);
        Permission::create(['name' => 'project-delete']);
        Permission::create(['name' => 'project-view']);

        // Role permissions
        Permission::create(['name' => 'role-list']);
        Permission::create(['name' => 'role-create']);
        Permission::create(['name' => 'role-edit']);
        Permission::create(['name' => 'role-delete']);
        Permission::create(['name' => 'role-view']);

        // User permissions
        Permission::create(['name' => 'user-list']);
        Permission::create(['name' => 'user-create']);
        Permission::create(['name' => 'user-edit']);
        Permission::create(['name' => 'user-delete']);
        Permission::create(['name' => 'user-view']);

        // Comment permission
        Permission::create(['name' => 'comment-create']);

        // Task File permissions
        Permission::create(['name' => 'task-file-upload']);
        Permission::create(['name' => 'task-file-download']);
        Permission::create(['name' => 'task-file-delete']);

        // Dashboard permission
        Permission::create(['name' => 'dashboard-view']);

        // Profile permissions
        Permission::create(['name' => 'profile-edit']);
        Permission::create(['name' => 'profile-delete']);
    }
}
