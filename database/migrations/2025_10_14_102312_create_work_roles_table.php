<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('short_name')->nullable()->unique();
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            $table->index(['name', 'is_active']);
        });

        // Pivot table for work role - category assignments
        Schema::create('work_role_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_role_id')->constrained()->onDelete('cascade');
            $table->foreignId('activity_category_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['work_role_id', 'activity_category_id']);
        });

        // Pivot table for user - work role assignments
        Schema::create('user_work_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('work_role_id')->constrained()->onDelete('cascade');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'work_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_work_roles');
        Schema::dropIfExists('work_role_categories');
        Schema::dropIfExists('work_roles');
    }
};
