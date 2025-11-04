<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This is the MAIN seeder for permissions and roles.
     * It reads from config/permissions.php as the single source of truth.
     *
     * Steps:
     * 1. Creates all permissions listed in config
     * 2. Creates roles if they don't exist
     * 3. Assigns permissions to roles based on mapping
     *
     * Safe to run multiple times (idempotent).
     */
    public function run()
    {
        $this->command->info('Starting permissions and roles setup...');

        // Reset cached permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissionsList = config('permissions.permissions', []);
        $rolePermissions = config('permissions.role_permissions', []);

        if (empty($permissionsList) || !is_array($permissionsList)) {
            $this->command->error('No permissions defined in config/permissions.php.');
            return;
        }

        DB::transaction(function () use ($permissionsList, $rolePermissions) {
            // Step 1: Create all permissions
            $this->command->info('Creating permissions...');
            foreach ($permissionsList as $permissionName) {
                Permission::firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => 'web',
                ]);
            }
            $this->command->info('✓ Permissions created');

            // Step 2: Create roles and assign permissions
            $this->command->info('Setting up roles...');

            // Create global-admin role (no permissions assigned, uses Gate::before)
            Role::firstOrCreate(['name' => 'global-admin', 'guard_name' => 'web']);

            foreach ($rolePermissions as $roleName => $permissions) {
                $role = Role::firstOrCreate([
                    'name' => $roleName,
                    'guard_name' => 'web',
                ]);

                // If role should get all permissions
                if ($permissions === 'all') {
                    $role->syncPermissions($permissionsList);
                    $this->command->info("✓ Role '{$roleName}' - assigned ALL permissions");
                }
                // Otherwise assign specific permissions
                else if (is_array($permissions)) {
                    $role->syncPermissions($permissions);
                    $this->command->info("✓ Role '{$roleName}' - assigned " . count($permissions) . " permissions");
                }
            }
        });

        // Reset permission cache
        try {
            \Artisan::call('permission:cache-reset');
            $this->command->info('✓ Permission cache cleared');
        } catch (\Exception $e) {
            $this->command->warn('Could not reset permission cache: ' . $e->getMessage());
        }

        $this->command->info('🎉 Permissions and roles setup complete!');
        $this->command->info('Run "php artisan permission:show" to see the result.');
    }
}
