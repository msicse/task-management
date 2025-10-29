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
        Schema::create('activity_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('parent_id')->nullable()->constrained('activity_categories')->onDelete('cascade');
            $table->string('code')->nullable()->unique()->comment('Auto-generated unique code: OPS_INSP_001');
            $table->string('name')->nullable();
            $table->integer('standard_time')->nullable()->comment('Standard time in minutes for this category');
            $table->text('definition')->nullable();
            $table->text('reference_protocol')->nullable();
            $table->text('objective')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_categories');
    }
};
