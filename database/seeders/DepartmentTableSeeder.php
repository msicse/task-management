<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::insert([
            ['name' => 'Information Technology', 'short_name' => 'IT', 'slug' => 'it'],
            ['name' => 'Engagement and Logistics', 'short_name' => 'admin', 'slug' => 'admin'],
            ['name' => 'Remediation Programme Department', 'short_name' => 'RPD', 'slug' => 'rpd'],
            ["id" => "1", "name" => "Information Technology", "short_name" => "IT", "slug" => "it"],
            ["id" => "2", "name" => "Admin & Support", "short_name" => "ADMIN", "slug" => "admin-and-coordination"],
            ["id" => "3", "name" => "Remediation Programme Department", "short_name" => "RPD", "slug" => "remediation-case-handlers"],
            ["id" => "4", "name" => "Occupational Safety and Health Complaints Unit", "short_name" => "OSHCMS", "slug" => "occupational-safety-and-health-complaints-unit"],
            ["id" => "5", "name" => "Occupational Safety and Health (OSH) Training Department", "short_name" => "OSH", "slug" => "training-team"],
            ["id" => "6", "name" => "Structural Safety Engineering Team", "short_name" => "SSE", "slug" => "structural-safety-engineering-team"],
            ["id" => "7", "name" => "Electrical Safety Engineering Team", "short_name" => "ESE", "slug" => "electrical-safety-engineering-team"],
            ["id" => "8", "name" => "Fire & Life Safety", "short_name" => "FLSE", "slug" => "fire-safety-engineering-team"],
            ["id" => "9", "name" => "Boiler Safety Engineering Team", "short_name" => "BSE", "slug" => "boiler-safety-engineering-team"],
            ["id" => "10", "name" => "Leadership Team", "short_name" => "LT", "slug" => "leadership-team"],
            ["id" => "11", "name" => "Human Resource Management", "short_name" => "HRM", "slug" => "human-resource-management"],
            ["id" => "13", "name" => "Accounts", "short_name" => "Accounts", "slug" => "finance-accounts"],
            ["id" => "14", "name" => "Media and Communications", "short_name" => "MCM", "slug" => "media-and-communications"],
            ["id" => "15", "name" => "Intern", "short_name" => "Intern", "slug" => "intern"]
        ]);
    }
}
