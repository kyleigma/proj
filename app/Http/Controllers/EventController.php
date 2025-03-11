<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class EventController extends Controller
{
    public function index()
    {
        return Inertia::render('events-table');
    }

    public function apiIndex()
    {
        try {
            // Debug: Log the attempt
            Log::info('Attempting to fetch events');

            // Debug: Check database connection
            try {
                DB::connection()->getPdo();
                Log::info('Database connection successful');
            } catch (\Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            // Debug: Check if table exists
            if (!Schema::hasTable('events')) {
                Log::error('Events table does not exist');
                return response()->json(['error' => 'Events table does not exist'], 500);
            }

            // Debug: Log query attempt
            Log::info('Attempting to query events table');

            $events = Event::orderBy('event_date', 'desc')->get();
            
            // Debug: Log success
            Log::info('Successfully retrieved events', ['count' => $events->count()]);
            
            return response()->json($events);
            
        } catch (\Exception $e) {
            Log::error('Error in apiIndex: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch events',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'location' => 'required|string|max:255',
                'distance' => 'nullable|numeric|min:0',
                'categories' => 'required|array',
                'categories.*' => 'string',
                'registration_fee' => 'nullable|numeric|min:0',
                'description' => 'nullable|string',
                'status' => 'required|string|in:upcoming,ongoing,finished',
                'is_leg' => 'boolean',
                'leg_number' => 'nullable|integer',
                'parent_event_id' => 'nullable|exists:events,id'
            ]);

            // Ensure categories is properly encoded as JSON
            $validated['categories'] = json_encode($validated['categories']);

            $event = Event::create($validated);

            return response()->json($event, 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Event $event)
    {
        try {
            // If only description is being updated, validate only description
            if ($request->has('description') && count($request->all()) === 1) {
                $validated = $request->validate([
                    'description' => 'nullable|string',
                ]);
            } else {
                // Your existing full validation for other cases
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'event_date' => 'required|date',
                    'event_time' => 'required',
                    'location' => 'required|string|max:255',
                    'distance' => 'nullable|numeric',
                    'category' => 'nullable|in:5K,10K,Half Marathon,Marathon',
                    'description' => 'nullable|string',
                    'registration_fee' => 'nullable|numeric',
                    'status' => 'required|in:upcoming,ongoing,finished',
                    'is_leg' => 'required|boolean',
                    'leg_number' => 'nullable|integer',
                    'parent_event_id' => 'nullable|exists:events,id'
                ]);
            }

            DB::beginTransaction();
            try {
                $event->update($validated);
                DB::commit();
                return response()->json($event);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to update event: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to update event'], 500);
            }
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in update: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update event'], 500);
        }
    }

    public function destroy(Event $event)
    {
        try {
            $event->delete();
            Cache::tags(['events'])->flush();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Failed to delete event: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete event'], 500);
        }
    }
}
