<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, create the new categories column
        Schema::table('events', function (Blueprint $table) {
            $table->json('categories')->nullable()->after('category');
        });

        // Migrate existing data
        DB::table('events')->get()->each(function ($event) {
            DB::table('events')
                ->where('id', $event->id)
                ->update([
                    'categories' => json_encode([$event->category])
                ]);
        });

        // Remove the old category column
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add back the original category column
            $table->string('category')->nullable()->after('distance');
        });

        // Restore data (will only keep the first category if multiple existed)
        DB::table('events')->get()->each(function ($event) {
            $categories = json_decode($event->categories);
            DB::table('events')
                ->where('id', $event->id)
                ->update([
                    'category' => $categories[0] ?? null
                ]);
        });

        // Remove the categories column
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('categories');
        });
    }
};