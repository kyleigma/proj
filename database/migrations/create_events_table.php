<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_event_id')->nullable(); // If null, it's a main event; otherwise, it's a leg
            $table->string('name');
            $table->date('event_date');
            $table->time('event_time');
            $table->string('location');
            $table->decimal('distance', 5, 2)->nullable(); // Distance (for legs)
            $table->enum('category', ['5K', '10K', 'Half Marathon', 'Marathon'])->nullable();
            $table->text('description')->nullable();
            $table->decimal('registration_fee', 10, 2)->nullable();
            $table->string('details_link')->nullable(); // Link to event details
            $table->enum('status', ['upcoming', 'ongoing', 'finished'])->default('upcoming');
            $table->boolean('is_leg')->default(false); // If true, this is an event leg
            $table->integer('leg_number')->nullable(); // Leg number (1, 2, 3, etc.)

            $table->timestamps();

            // Foreign key to reference parent event (for legs)
            $table->foreign('parent_event_id')->references('id')->on('events')->onDelete('cascade');
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
