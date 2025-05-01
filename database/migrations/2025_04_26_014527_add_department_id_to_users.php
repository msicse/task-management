<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')->default(1)->after('id')->constrained('departments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('department_id');
            $table->dropColumn('designation');
            $table->dropColumn('employee_id');
            $table->dropColumn('blood');
            $table->dropColumn('location');
            $table->dropColumn('date_of_join');
            $table->dropColumn('date_of_resign');
            $table->dropColumn('status');
            $table->dropColumn('about');
            $table->dropColumn('image');
        });
    }
};
