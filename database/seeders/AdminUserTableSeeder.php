<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminUserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin role with all permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $allPermissions = Permission::pluck('id', 'id')->all();
        $adminRole->syncPermissions($allPermissions);

        // Create Basic User role with limited task permissions
        $userRole = Role::create(['name' => 'User']);
        $userPermissions = Permission::whereIn('name', [
            'task-create',
            'task-view-own',
            'task-update-own',
        ])->get();
        $userRole->syncPermissions($userPermissions);

        // Assign roles to users
        User::find(1)->assignRole([$adminRole->id]);
        User::find(2)->assignRole([$userRole->id]);
    }
}
