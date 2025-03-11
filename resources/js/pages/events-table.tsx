
import { Event, EventFormData } from '@/types/events';
import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Eye, Pencil, Plus, Trash, LoaderCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EventDialogs } from '@/components/events/event-dialogs';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default function EventsTable() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    useEffect(() => {
        console.log('Fetching events...');
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/events');
            
            // Debug the response
            console.log('Raw API response:', response.data);
            
            // Transform the data without personal_record
            const formattedEvents = response.data.map((event: Event) => ({
                ...event,
                registration_fees: event.registration_fees || {},
                categories: Array.isArray(event.categories) ? event.categories : []
            }));
            
            console.log('Formatted events:', formattedEvents);
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    // Remove the unused refreshTable function since we're updating state directly

    const handleCreateEvent = async (eventData: EventFormData) => {
        try {
            console.log('Sending event data:', eventData);
            
            const response = await axios.post('/api/events', eventData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            if (response.status === 201 || response.status === 200) {
                await fetchEvents();
                return response.data;
            }
        } catch (error: any) {
            console.error('Detailed error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to create event');
        }
    };

    const handleEditEvent = async (eventData: EventFormData) => {
        try {
            // Since we need the id for the API call, we need to get it from selectedEvent
            if (!selectedEvent?.id) {
                throw new Error('No event selected for editing');
            }

            const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server validation errors:', errorData);
                throw new Error(errorData.message || 'Failed to update event');
            }

            await fetchEvents();
        } catch (error) {
            console.error('Error editing event:', error);
            throw error;
        }
    };

    const handleDeleteEvent = async (id: number) => {
        try {
            // Your delete logic here
            console.log('Deleting event:', id);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const columns: ColumnDef<Event>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-8 flex items-center gap-2 p-0 font-medium w-full justify-start hover:bg-transparent"
                >
                    Event Name
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                </Button>
            ),
            cell: ({ row }) => {
                const event = row.original;
                const isLeg = event.is_leg;
                const parentEvent = events.find((e: Event) => e.id === event.parent_event_id);
                
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            {isLeg && (
                                <div className="flex items-center text-muted-foreground">
                                    <span className="mr-2">└─</span>
                                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                                        Leg {event.leg_number}
                                    </span>
                                </div>
                            )}
                            <span className={isLeg ? "ml-4" : "font-medium"}>
                                {event.name}
                            </span>
                        </div>
                        {isLeg && parentEvent && (
                            <span className="text-xs text-muted-foreground ml-6">
                                Part of: {parentEvent.name}
                            </span>
                        )}
                    </div>
                );
            },
            size: 300,
        },
        {
            accessorKey: 'event_date',
            header: 'Date & Time',
            cell: ({ row }) => {
                const date = new Date(row.getValue('event_date'));
                const time = row.original.event_time;
                return (
                    <div className="flex flex-col">
                        <span>{date.toLocaleDateString()}</span>
                        <span className="text-sm text-muted-foreground">{time}</span>
                    </div>
                );
            },
            size: 120,
        },
        {
            id: 'categories',
            header: 'Categories',
            cell: ({ row }) => {
                const categories = row.original.categories;
                return (
                    <div className="col-span-3">
                        {categories && categories.length > 0 
                            ? categories.join(', ') 
                            : 'No categories'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 150,
        },
        {
            accessorKey: 'registration_fees',
            header: 'Registration Fees',
            cell: ({ row }) => {
                console.log('Row data:', row.original); // Add this debug line
                
                const fees = row.original.registration_fees;
                if (!fees || typeof fees !== 'object') {
                    return <div>Free</div>;
                }
                
                return (
                    <div className="space-y-1">
                        {Object.entries(fees).map(([category, fee]) => (
                            <div key={category} className="text-sm">
                                {category}: ₱{(Number(fee) || 0).toFixed(2)}
                            </div>
                        ))}
                    </div>
                );
            },
            size: 150,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-8 flex items-center gap-2 p-0 font-medium w-full justify-start hover:bg-transparent"
                >
                    Status
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                </Button>
            ),
            size: 100,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const [isEditing, setIsEditing] = useState(false);
                const [description, setDescription] = useState((row.getValue('description') as string) ?? '');
                const [isSaving, setIsSaving] = useState(false);
                
                const handleSave = async () => {
                    if (description === row.getValue('description')) {
                        setIsEditing(false);
                        return;
                    }

                    try {
                        setIsSaving(true);
                        const response = await axios.put(`/api/events/${row.original.id}`, 
                            { description: description || null }
                        );
                        
                        if (response.status === 200) {
                            setEvents(prevEvents => 
                                prevEvents.map(event => 
                                    event.id === row.original.id 
                                        ? { ...event, description: description }
                                        : event
                                )
                            );
                            setIsEditing(false);
                        }
                    } catch (error) {
                        console.error('Error updating description:', error);
                        setDescription((row.getValue('description') as string) ?? '');
                    } finally {
                        setIsSaving(false);
                    }
                };

                const handleKeyDown = (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSave();
                    } else if (e.key === 'Escape') {
                        setDescription((row.getValue('description') as string) ?? '');
                        setIsEditing(false);
                    }
                };

                const handleClickOutside = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('.description-edit-container')) {
                        if (description !== row.getValue('description')) {
                            handleSave();
                        } else {
                            setIsEditing(false);
                        }
                    }
                };

                useEffect(() => {
                    if (isEditing) {
                        document.addEventListener('mousedown', handleClickOutside);
                        return () => {
                            document.removeEventListener('mousedown', handleClickOutside);
                        };
                    }
                }, [isEditing, description]);

                if (isEditing) {
                    return (
                        <div className="description-edit-container relative flex items-center w-full">
                            <Input
                                autoFocus
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pr-[4.5rem]"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                                {description !== row.getValue('description') && (
                                    <Button 
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            '✓'
                                        )}
                                    </Button>
                                )}
                                <Button 
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-gray-100"
                                    onClick={() => {
                                        setDescription((row.getValue('description') as string) ?? '');
                                        setIsEditing(false);
                                    }}
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div 
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[2rem] flex items-center text-muted-foreground italic"
                    >
                        {description || 'Click to add description...'}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                setSelectedEvent(event);
                                setViewDialogOpen(true);
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                setSelectedEvent(event);
                                setEditDialogOpen(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                setSelectedEvent(event);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10, // Increased page size
            },
        },
    });

    // Loading state component
    if (isLoading) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Events', href: '/events-table' }]}>
                <Head title="Events" />
                <div className="flex h-full items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading events...</span>
                </div>
            </AppLayout>
        );
    }

    // Error state component
    if (error) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Events', href: '/events-table' }]}>
                <Head title="Events" />
                <div className="flex h-full flex-col items-center justify-center">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Button onClick={fetchEvents}>Retry</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Events', href: '/events-table' }]}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                    </Button>
                    <Input
                        placeholder="Search events..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead 
                                            key={header.id} 
                                            style={{ width: header.getSize() }}
                                            className="px-4 py-2 bg-gray-50/80"
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell 
                                                key={cell.id} 
                                                style={{ width: cell.column.getSize() }}
                                                className="px-4 py-2"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No events found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>

                <EventDialogs
                    viewDialogOpen={viewDialogOpen}
                    setViewDialogOpen={setViewDialogOpen}
                    editDialogOpen={editDialogOpen}
                    setEditDialogOpen={setEditDialogOpen}
                    deleteDialogOpen={deleteDialogOpen}
                    setDeleteDialogOpen={setDeleteDialogOpen}
                    createDialogOpen={createDialogOpen}
                    setCreateDialogOpen={setCreateDialogOpen}
                    selectedEvent={selectedEvent}
                    onCreate={handleCreateEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    initialFormState={{
                        name: '',
                        event_date: '',
                        event_time: '',
                        location: '',
                        distance: 0,
                        categories: [],
                        description: '',
                        registration_fees: {},
                        status: 'upcoming',
                        is_leg: false,
                        leg_number: null,
                        parent_event_id: null,
                    }}
                />
            </div>
        </AppLayout>
    );
}
