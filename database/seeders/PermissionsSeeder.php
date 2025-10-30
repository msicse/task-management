<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder is idempotent: it will create any permission names listed in
     * `config('permissions.permissions')` that are missing and leave existing
     * permissions untouched. It's safe to run in production.
     */
    public function run()
    {
        $list = config('permissions.permissions', []);

        if (empty($list) || !is_array($list)) {
            $this->command->info('No permissions defined in config/permissions.php.');
            return;
        }

        DB::transaction(function () use ($list) {
            foreach ($list as $permissionName) {
                // firstOrCreate ensures idempotency
                Permission::firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => 'web',
                ]);
            }
        });

        // Reset permission cache so changes take effect immediately
        try {
            \Artisan::call('permission:cache-reset');
        } catch (\Exception $e) {
            // not fatal, but log to console when available
            $this->command->warn('Failed to reset permission cache: ' . $e->getMessage());
        }

        $this->command->info('Permissions seeding complete.');
    }
}
