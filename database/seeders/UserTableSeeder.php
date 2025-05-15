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
        // $users = [
        //     [
        //         'name' => 'Md Toufick Imam',
        //         'email' => 'toufick.imam@rsc-bd.org',
        //         'password' => bcrypt(12345678),
        //         'designation' => 'Senior Deputy Manager',
        //         'employee_id' => '235',
        //         'phone' => '01709641103',
        //         'blood' => 'B+',
        //         'gender' => 'male',
        //         'location' => 'Dhaka',
        //         'date_of_join' => '2025-04-27',
        //         'status' => 'active',
        //         'department_id' => 3,
        //         'email_verified_at' => '2025-05-05 05=>39=>03',
        //         'role' => 'Team Leader',

        //     ],
        //     [
        //         'name' => 'Shah Sefat Uddin Ahmed',
        //         'email' => 'sefat.ahmed@rsc-bd.org',
        //         'password' => bcrypt(12345678),
        //         'designation' => 'Senior Head of Department',
        //         'employee_id' => '40',
        //         'phone' => '01766695942',
        //         'blood' => 'B+',
        //         'gender' => 'male',
        //         'location' => 'Dhaka',
        //         'date_of_join' => '2025-04-28',
        //         'status' => 'active',
        //         'department_id' => 3,
        //         'email_verified_at' => '2025-05-05 05=>41=>40',
        //         'role' => 'Manager',
        //     ],
        //     [
        //         'name' => 'Mohammad Rejaur Rahman',
        //         'email' => 'rejaur.rahman@rsc-bd.org',
        //         'password' => bcrypt(12345678),
        //         'designation' => 'Team Leader',
        //         'employee_id' => '114',
        //         'phone' => '01769969023',
        //         'blood' => 'B+',
        //         'gender' => 'male',
        //         'location' => 'Dhaka',
        //         'date_of_join' => '2025-05-05',
        //         'status' => 'active',
        //         'department_id' => 3,
        //         'email_verified_at' => '2025-05-05 05=>41=>40',
        //         'role' => 'Team Leader',
        //     ],
        //     [
        //         'name' => 'Musfiqur Rahman Bhuiyan',
        //         'email' => 'musfiqur.rahman@rsc-bd.org',
        //         'password' => bcrypt(12345678),
        //         'designation' => 'Team Leader- Remediation Programme',
        //         'employee_id' => '467',
        //         'phone' => '01766695924',
        //         'blood' => 'B+',
        //         'gender' => 'male',
        //         'location' => 'Dhaka',
        //         'date_of_join' => '2025-04-28',
        //         'status' => 'active',
        //         'department_id' => 3,
        //         'email_verified_at' => '2025-05-05 05=>41=>40',
        //         'role' => 'Team Leader',
        //     ],
        // ];



        $users = [
            [
                "name" => "A.K.M Monjur Hossain Bahar",
                "email" => "monjur.hossain@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "227",
                "phone" => "1709641096",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Abdur Rahman",
                "email" => "abdur.rahman@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "433",
                "phone" => "1700710193",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Abu Md Zakaria",
                "email" => "abu.zakaria@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "404",
                "phone" => "1766695927",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Anika Ahmad",
                "email" => "anika.ahmad@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "305",
                "phone" => "1700710196",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Asaduzzaman Hridoy",
                "email" => "asaduzzaman.hridoy@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "492",
                "phone" => "1894971812",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Charles Joeakim D.Rozario",
                "email" => "charles.rozario@rsc-bd.org",
                "designation" => "Team Leader- Remediation Programme",
                "employee_id" => "209",
                "phone" => "1709641076",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Team Leader"
            ],
            [
                "name" => "Istiaque Ahmed",
                "email" => "istiaque.ahmed@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "306",
                "phone" => "1700710198",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Kushal Majumder",
                "email" => "kushal.majumder@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "450",
                "phone" => "1713369166",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Labiba Rahman Oni",
                "email" => "labiba.rahman@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "232",
                "phone" => "1709641101",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Maliha Sarahzin",
                "email" => "maliha.sarahzin@rsc-bd.org",
                "designation" => "Senior Remediation Programme",
                "employee_id" => "290",
                "phone" => "1700710181",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Delwar Hosain",
                "email" => "dhosain.rasel@rsc-bd.org",
                "designation" => "Team Leader",
                "employee_id" => "46",
                "phone" => "1766695947",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Team Leader"
            ],
            [
                "name" => "Md. Kabirul Shahid Shishir",
                "email" => "kabirul.shahid@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "486",
                "phone" => "1894971802",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Mahabub Aloom",
                "email" => "mahabub.aloom@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "485",
                "phone" => "1894971797",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Mostafizur Rahman",
                "email" => "md.mostafizur@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "493",
                "phone" => "1894971810",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Nahid Hassan",
                "email" => "nahid.hassan@rsc-bd.org",
                "designation" => "Inspection Support Coordinator",
                "employee_id" => "314",
                "phone" => "1713369158",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Parvez Rana",
                "email" => "parvez.rana@rsc-bd.org",
                "designation" => "Officer-Inspection Scheduling",
                "employee_id" => "298",
                "phone" => "1700710189",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Rafial Amin",
                "email" => "rafial.amin@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "308",
                "phone" => "1700710199",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Rafsonzani Chowdhury",
                "email" => "rafsonzani.chowdhury@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "372",
                "phone" => "1766695948",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Ramjan Ali",
                "email" => "ramjan.ali@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "373",
                "phone" => "1769969081",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Shahriar Aman",
                "email" => "shahriar.aman@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "292",
                "phone" => "1700710183",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md. Tausif",
                "email" => "md.tausif@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "365",
                "phone" => "1766695922",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Md.Fazle Rabby",
                "email" => "fazle.rabby@rsc-bd.org",
                "designation" => "Senior Remediation Programme",
                "employee_id" => "208",
                "phone" => "1709641075",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Mehedi Hasan",
                "email" => "mehedi.hasan1@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "491",
                "phone" => "1894971811",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Momtaz Aktar",
                "email" => "momtaz.aktar@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "231",
                "phone" => "1709641100",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Mousumi Mojumder",
                "email" => "mousumi.mojumder@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "117",
                "phone" => "1769969026",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Muhammad Aftab Uddin Chowdhury",
                "email" => "aftab.uddin@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "39",
                "phone" => "1766695941",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Rajib Roy",
                "email" => "rajib.roy@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "99",
                "phone" => "1769969008",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Rowshan Ara Akter Runa",
                "email" => "rowshan.runa@rsc-bd.org",
                "designation" => "Senior Remediation Programme",
                "employee_id" => "8",
                "phone" => "1766695903",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Sadman Siddique",
                "email" => "sadman.siddique@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "204",
                "phone" => "1709641071",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Shahid Bin Islam",
                "email" => "shahid.islam@rsc-bd.org",
                "designation" => "Senior Remediation Programme Officer",
                "employee_id" => "111",
                "phone" => "1769969018",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Sharmi Sen",
                "email" => "sharmi.sen@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "374",
                "phone" => "1769969082",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ],
            [
                "name" => "Sheikh Shadi",
                "email" => "sheikh.shadi@rsc-bd.org",
                "designation" => "Remediation Programme Officer",
                "employee_id" => "273",
                "phone" => "1700710164",
                "status" => "active",
                "email_verified_at" => "2025-05-05 5:39",
                "department_id" => "3",
                "password" => bcrypt(12345678),
                "role" => "Employee"
            ]
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
