<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'event_date',
        'event_time',
        'location',
        'distance',
        'description',
        'registration_fee',
        'status',
        'is_leg',
        'leg_number',
        'parent_event_id',
        'categories'
    ];

    protected $casts = [
        'categories' => 'array',
        'is_leg' => 'boolean',
        'event_date' => 'date',
        'distance' => 'decimal:2',
        'registration_fee' => 'decimal:2'
    ];
}
