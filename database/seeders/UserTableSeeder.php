<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Md Toufick Imam',
                'email' => 'toufick.imam@rsc-bd.org',
                'password' => bcrypt(12345678),
                'designation' => 'Senior Deputy Manager',
                'employee_id' => '235',
                'phone' => '01709641103',
                'blood' => 'B+',
                'gender' => 'male',
                'location' => 'Dhaka',
                'date_of_join' => '2025-04-27',
                'status' => 'active',
                'department_id' => 3,
                'email_verified_at' => '2025-05-05 05:39:03',
                'role' => 'Team Leader',

            ],
            [
                'name' => 'Shah Sefat Uddin Ahmed',
                'email' => 'sefat.ahmed@rsc-bd.org',
                'password' => bcrypt(12345678),
                'designation' => 'Senior Head of Department',
                'employee_id' => '40',
                'phone' => '01766695942',
                'blood' => 'B+',
                'gender' => 'male',
                'location' => 'Dhaka',
                'date_of_join' => '2025-04-28',
                'status' => 'active',
                'department_id' => 3,
                'email_verified_at' => '2025-05-05 05:41:40',
                'role' => 'Manager',
            ],
            [
                'name' => 'Mohammad Rejaur Rahman',
                'email' => 'rejaur.rahman@rsc-bd.org',
                'password' => bcrypt(12345678),
                'designation' => 'Team Leader',
                'employee_id' => '114',
                'phone' => '01769969023',
                'blood' => 'B+',
                'gender' => 'male',
                'location' => 'Dhaka',
                'date_of_join' => '2025-05-05',
                'status' => 'active',
                'department_id' => 3,
                'email_verified_at' => '2025-05-05 05:41:40',
                'role' => 'Team Leader',
            ],
            [
                'name' => 'Musfiqur Rahman Bhuiyan',
                'email' => 'musfiqur.rahman@rsc-bd.org',
                'password' => bcrypt(12345678),
                'designation' => 'Team Leader- Remediation Programme',
                'employee_id' => '467',
                'phone' => '01766695924',
                'blood' => 'B+',
                'gender' => 'male',
                'location' => 'Dhaka',
                'date_of_join' => '2025-04-28',
                'status' => 'active',
                'department_id' => 3,
                'email_verified_at' => '2025-05-05 05:41:40',
                'role' => 'Team Leader',
            ],
        ];


            // Create users and assign roles
        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']); // Remove role from user data array

            // Check if user exists, if not create it
            $user = User::where('email', $userData['email'])->first();

            if (!$user) {
                $user = User::create($userData);

                // Assign role to user
                if ($role) {
                    $userRole = Role::where('name', $role)->first();
                    if ($userRole) {
                        $user->assignRole($userRole);
                    }
                }
            }
        }


    }
}
