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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('event_date');
            $table->string('event_time');
            $table->string('location');
            $table->decimal('distance', 8, 2)->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            $table->decimal('registration_fee', 10, 2)->nullable();
            $table->string('status')->default('upcoming');
            $table->boolean('is_leg')->default(false);
            $table->integer('leg_number')->nullable();
            $table->foreignId('parent_event_id')->nullable()->constrained('events')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
