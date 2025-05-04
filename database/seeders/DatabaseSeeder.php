<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\AdminUserTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
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

        User::create([
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


        // Project::factory()
        // ->count(10)
        // ->hasTasks(10)
        // ->create();

        $this->call(PermissionTableSeeder::class);
        $this->call(AdminUserTableSeeder::class);
        $this->call(DepartmentTableSeeder::class);

    }


}
