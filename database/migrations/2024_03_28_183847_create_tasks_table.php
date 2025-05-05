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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('factory_id')->nullable();
            $table->string('status')->default('pending');
            $table->string('priority');
            $table->string('time_log')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->longText('description')->nullable();
            $table->unsignedTinyInteger('creator_rating')->nullable(); // Creator → Assignee
            $table->unsignedTinyInteger('assignee_rating')->nullable(); // Assignee → Creator
            $table->string('image_path')->nullable();
            $table->foreignId('assigned_user_id')->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
