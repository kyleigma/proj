<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add new JSON column for category-specific fees
            $table->json('registration_fees')->nullable()->after('registration_fee');
        });

        // Migrate existing data
        DB::table('events')->get()->each(function ($event) {
            if ($event->registration_fee !== null) {
                $categories = json_decode($event->categories) ?? [];
                $fees = array_fill_keys($categories, $event->registration_fee);
                
                DB::table('events')
                    ->where('id', $event->id)
                    ->update([
                        'registration_fees' => json_encode($fees)
                    ]);
            }
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('registration_fee');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->decimal('registration_fee', 10, 2)->nullable()->after('description');
        });

        // Restore data (will use the first fee found as the general fee)
        DB::table('events')->get()->each(function ($event) {
            $fees = json_decode($event->registration_fees, true) ?? [];
            $firstFee = !empty($fees) ? reset($fees) : null;
            
            DB::table('events')
                ->where('id', $event->id)
                ->update([
                    'registration_fee' => $firstFee
                ]);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('registration_fees');
        });
    }
};