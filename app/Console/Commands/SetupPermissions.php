<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class SetupPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-permissions {--f|fresh : Clear existing permissions before running the seeder}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sets up all permissions, roles and assigns them to users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('fresh')) {
            $this->info('Clearing existing permissions and roles...');

            // Truncate the tables in the right order to avoid foreign key constraints
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Clear role_has_permissions table
            DB::table('role_has_permissions')->truncate();

            // Clear model_has_permissions table
            DB::table('model_has_permissions')->truncate();

            // Clear model_has_roles table
            DB::table('model_has_roles')->truncate();

            // Clear permissions table
            DB::table('permissions')->truncate();

            // Clear roles table
            DB::table('roles')->truncate();

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            $this->info('Existing permissions and roles cleared successfully.');
        }

        $this->info('Running CompletePermissionSeeder...');
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\CompletePermissionSeeder',
        ]);

        $this->info('Permissions set up successfully!');

        $this->info('You now have the following roles:');
        $this->line('- Admin: Full access to all features');
        $this->line('- Manager: Can manage tasks, approve completions, assign tasks');
        $this->line('- Team Leader: Can assign tasks to team, approve team\'s tasks');
        $this->line('- Employee: Can view assigned tasks, mark as complete');

        $this->info('An admin user has been created or updated with:');
        $this->line('Email: admin@example.com');
        $this->line('Password: password');

        return Command::SUCCESS;
    }
}
