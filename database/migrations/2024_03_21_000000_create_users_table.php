<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('designation')->nullable();
            $table->string('employee_id')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('blood')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('location')->nullable();
            $table->date('date_of_join')->nullable();
            $table->date('date_of_resign')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('about')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
}; 