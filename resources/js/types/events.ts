export interface Event {
    id?: number;
    name: string;
    event_date: string;
    event_time: string;
    location: string;
    categories: string[];
    registration_fees: Record<string, number>;
    status: 'upcoming' | 'ongoing' | 'finished';
    is_leg: boolean;
    distance?: number | null;
    description?: string | null;
    leg_number?: number | null;
    parent_event_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface EventFormData extends Omit<Event, 'id' | 'created_at' | 'updated_at'> {
    // Any additional form-specific fields
}
