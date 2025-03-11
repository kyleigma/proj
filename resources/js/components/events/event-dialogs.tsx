import { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import { Event, EventFormData } from '@/types/events';

interface EventDialogsProps {
    viewDialogOpen: boolean;
    setViewDialogOpen: (open: boolean) => void;
    editDialogOpen: boolean;
    setEditDialogOpen: (open: boolean) => void;
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    createDialogOpen: boolean;
    setCreateDialogOpen: (open: boolean) => void;
    selectedEvent: Event | null;
    onEdit: (event: Event) => Promise<void>;
    onCreate: (event: EventFormData) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    initialFormState: EventFormData;
}

export function EventDialogs({ 
    viewDialogOpen,
    setViewDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    selectedEvent,
    onCreate,
    onEdit,
    onDelete,
    initialFormState
}: EventDialogsProps) {
    const [createForm, setCreateForm] = useState<EventFormData>(initialFormState);
    const [editForm, setEditForm] = useState<EventFormData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Remove these local state declarations since we're using props instead
    // const [createDialogOpen, setCreateDialogOpen] = useState(false);
    // const [editDialogOpen, setEditDialogOpen] = useState(false);
    // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Reset forms when dialogs close
    useEffect(() => {
        if (!editDialogOpen) {
            if (selectedEvent) {
                const eventData: EventFormData = {
                    name: selectedEvent.name,
                    event_date: selectedEvent.event_date,
                    event_time: selectedEvent.event_time,
                    location: selectedEvent.location,
                    distance: selectedEvent.distance,
                    categories: selectedEvent.categories,
                    description: selectedEvent.description,
                    registration_fees: selectedEvent.registration_fees || {},
                    status: selectedEvent.status,
                    is_leg: selectedEvent.is_leg,
                    leg_number: selectedEvent.leg_number,
                    parent_event_id: selectedEvent.parent_event_id
                };

                setEditForm(eventData);
            } else {
                setEditForm(null);
            }
            setIsSubmitting(false);
        }
    }, [editDialogOpen, selectedEvent]);

    useEffect(() => {
        if (!createDialogOpen) {
            setCreateForm(initialFormState);
            setIsSubmitting(false);
        }
    }, [createDialogOpen]);

    useEffect(() => {
        if (selectedEvent) {
            setEditForm({
                ...selectedEvent,
                registration_fees: selectedEvent.registration_fees || {}
            });
        } else {
            setEditForm(null);
        }
    }, [selectedEvent]);

    // Validation functions
    const isCreateFormValid = useCallback(() => {
        return Boolean(
            createForm.name &&
            createForm.name.trim() !== '' &&
            createForm.categories.length === 1
        );
    }, [createForm]);

    const isEditFormValid = useCallback(() => {
        return Boolean(
            editForm?.name &&
            editForm.name.trim() !== '' &&
            editForm.categories.length === 1
        );
    }, [editForm]);

    const categories = ['5K', '10K', 'Half Marathon', 'Marathon'];

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || !isCreateFormValid()) {
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Ensure all required fields are properly formatted
            const formData: EventFormData = {
                name: createForm.name.trim(),
                event_date: createForm.event_date || new Date().toISOString().split('T')[0],
                event_time: createForm.event_time || '00:00',
                location: createForm.location.trim() || '',
                categories: createForm.categories,
                registration_fees: Object.fromEntries(
                    createForm.categories.map(category => [
                        category,
                        Number(createForm.registration_fees[category] || 0)
                    ])
                ),
                status: createForm.status || 'upcoming',
                is_leg: false,
                distance: Number(createForm.distance) || 0,
                description: createForm.description?.trim() || '',
                leg_number: null,
                parent_event_id: null
            };
            
            console.log('Submitting form data:', formData); // Debug log
            await onCreate(formData);
            setCreateDialogOpen(false);
            setCreateForm(initialFormState);
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || !editForm || !isEditFormValid() || !selectedEvent) {
            return;
        }

        try {
            setIsSubmitting(true);
            
            const formData: Event = {
                ...editForm,
                id: selectedEvent.id,
                created_at: selectedEvent.created_at,
                updated_at: selectedEvent.updated_at,
                event_date: editForm.event_date || new Date().toISOString().split('T')[0],
                event_time: editForm.event_time || '00:00',
                registration_fees: editForm.categories.reduce((fees: { [key: string]: number }, category: string) => ({
                    ...fees,
                    [category]: Number(editForm.registration_fees?.[category] ?? 0)
                }), {}),
                status: editForm.status || 'upcoming',
                is_leg: editForm.is_leg || false,
                distance: Number(editForm.distance) || 0
            };
            
            await onEdit(formData);
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (isSubmitting || !selectedEvent || typeof selectedEvent.id !== 'number') {
            return;
        }

        try {
            setIsSubmitting(true);
            await onDelete(selectedEvent.id);
            setDeleteDialogOpen(false);
            setViewDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>View Event</DialogTitle>
                        <DialogDescription>
                            View event details and information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {selectedEvent && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <div className="col-span-3">{selectedEvent.name}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Location</Label>
                                    <div className="col-span-3">{selectedEvent.location}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Categories</Label>
                                    <div className="col-span-3">{selectedEvent.categories.join(', ')}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Registration Fees</Label>
                                    <div className="col-span-3">
                                        {selectedEvent.registration_fees ? (
                                            Object.entries(selectedEvent.registration_fees).map(([category, fee]) => (
                                                <div key={category}>
                                                    {category}: ₱{fee?.toFixed(2) ?? 'Free'}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">No registration fees set</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                    setEditDialogOpen(open);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>
                            Make changes to your event here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            {editForm && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">Event Name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Date & Time</Label>
                                        <div className="col-span-3 grid grid-cols-2 gap-2">
                                            <Input
                                                type="date"
                                                value={editForm.event_date}
                                                onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                                            />
                                            <Input
                                                type="time"
                                                value={editForm.event_time}
                                                onChange={(e) => setEditForm({ ...editForm, event_time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-categories" className="text-right">Category</Label>
                                        <select
                                            id="edit-categories"
                                            value={editForm.categories[0] || ''}
                                            onChange={(e) => {
                                                const selectedCategory = e.target.value;
                                                setEditForm({
                                                    ...editForm,
                                                    categories: [selectedCategory],
                                                    registration_fees: {
                                                        [selectedCategory]: 0
                                                    }
                                                });
                                            }}
                                            className="col-span-3 form-select"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Registration fee input - show only when a category is selected */}
                                    {editForm.categories[0] && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-fee" className="text-right">
                                                Registration Fee (₱)
                                            </Label>
                                            <Input
                                                id="edit-fee"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={(editForm.registration_fees[editForm.categories[0]] ?? 0).toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value ? parseFloat(e.target.value) : 0;
                                                    setEditForm({
                                                        ...editForm,
                                                        registration_fees: {
                                                            [editForm.categories[0]]: newValue
                                                        }
                                                    });
                                                }}
                                                className="col-span-3"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-location" className="text-right">Location</Label>
                                        <Input
                                            id="edit-location"
                                            value={editForm.location}
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-status" className="text-right">Status</Label>
                                        <select
                                            id="edit-status"
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Event['status'] })}
                                            className="col-span-3 form-select"
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="finished">Finished</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-description" className="text-right">Description</Label>
                                        <textarea
                                            id="edit-description"
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="col-span-3 min-h-[100px]"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button 
                                type="submit"
                                disabled={isSubmitting || !isEditFormValid()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                    setDeleteDialogOpen(open);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your event.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                    setCreateDialogOpen(open);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                            Add a new event to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="create-name" className="text-right">Event Name</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date & Time</Label>
                                <div className="col-span-3 grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={createForm.event_date}
                                        onChange={(e) => setCreateForm({ ...createForm, event_date: e.target.value })}
                                    />
                                    <Input
                                        type="time"
                                        value={createForm.event_time}
                                        onChange={(e) => setCreateForm({ ...createForm, event_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="create-categories" className="text-right">Category</Label>
                                <select
                                    id="create-categories"
                                    value={createForm.categories[0] || ''}
                                    onChange={(e) => {
                                        const selectedCategory = e.target.value;
                                        setCreateForm({
                                            ...createForm,
                                            categories: [selectedCategory],
                                            registration_fees: {
                                                [selectedCategory]: 0
                                            }
                                        });
                                    }}
                                    className="col-span-3 form-select"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Registration fee input - show only when a category is selected */}
                            {createForm.categories[0] && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="create-fee" className="text-right">
                                        Registration Fee (₱)
                                    </Label>
                                    <Input
                                        id="create-fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.registration_fees[createForm.categories[0]] ?? '0'}
                                        onChange={(e) => {
                                            const newValue = e.target.value ? parseFloat(e.target.value) : 0;
                                            setCreateForm({
                                                ...createForm,
                                                registration_fees: {
                                                    [createForm.categories[0]]: newValue
                                                }
                                            });
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="create-location" className="text-right">Location</Label>
                                <Input
                                    id="create-location"
                                    value={createForm.location}
                                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="create-status" className="text-right">Status</Label>
                                <select
                                    id="create-status"
                                    value={createForm.status}
                                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as Event['status'] })}
                                    className="col-span-3 form-select"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="finished">Finished</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="create-description" className="text-right">Description</Label>
                                <textarea
                                    id="create-description"
                                    value={createForm.description || ''}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="col-span-3 min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                type="submit"
                                disabled={isSubmitting || !isCreateFormValid()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Event'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
