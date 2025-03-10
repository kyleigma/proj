import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Eye, Pencil, Plus, Trash } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Event {
    id: number;
    name: string;
    event_date: string;
    event_time: string;
    location: string;
    distance: number;
    category: string;
    description: string;
    registration_fee: number;
    status: string;
    is_leg: boolean;
    leg_number: number | null;
}

export default function EventsTable() {
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const data: Event[] = [
        {
            id: 1,
            name: 'Spring Marathon 2024',
            event_date: '2024-03-21',
            event_time: '08:00:00',
            location: 'Central Park',
            distance: 42.2,
            category: 'Marathon',
            description: 'Annual spring marathon event',
            registration_fee: 50.00,
            status: 'upcoming',
            is_leg: false,
            leg_number: null
        },
        {
            id: 2,
            name: 'Summer 5K Run',
            event_date: '2024-06-15',
            event_time: '09:00:00',
            location: 'Riverside Park',
            distance: 5,
            category: '5K',
            description: 'Beginner-friendly summer run',
            registration_fee: 25.00,
            status: 'upcoming',
            is_leg: false,
            leg_number: null
        }
    ];

    const columns: ColumnDef<Event>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Event Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'event_date',
            header: 'Date',
            cell: ({ row }) => new Date(row.getValue('event_date')).toLocaleDateString(),
        },
        {
            accessorKey: 'location',
            header: 'Location',
        },
        {
            accessorKey: 'category',
            header: 'Category',
        },
        {
            accessorKey: 'registration_fee',
            header: 'Fee',
            cell: ({ row }) => {
                const fee = row.getValue('registration_fee') as number;
                return `$${fee.toFixed(2)}`;
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
                            onClick={() => {
                                setSelectedEvent(event);
                                setViewDialogOpen(true);
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSelectedEvent(event);
                                setEditDialogOpen(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
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
        data,
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
                pageSize: 5,
            },
        },
    });

    return (
        <AppLayout breadcrumbs={[{ title: 'Events', href: '/events' }]}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <Input
                        placeholder="Search events..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
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
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
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

                {/* View Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Event Details</DialogTitle>
                        </DialogHeader>
                        {selectedEvent && (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <div className="col-span-3">{selectedEvent.name}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Date</Label>
                                    <div className="col-span-3">{new Date(selectedEvent.event_date).toLocaleDateString()}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Location</Label>
                                    <div className="col-span-3">{selectedEvent.location}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Category</Label>
                                    <div className="col-span-3">{selectedEvent.category}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Fee</Label>
                                    <div className="col-span-3">${selectedEvent.registration_fee.toFixed(2)}</div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setViewDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                        </DialogHeader>
                        {selectedEvent && (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" className="col-span-3" defaultValue={selectedEvent.name} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">Date</Label>
                                    <Input id="date" type="date" className="col-span-3" defaultValue={selectedEvent.event_date} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="location" className="text-right">Location</Label>
                                    <Input id="location" className="col-span-3" defaultValue={selectedEvent.location} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Category</Label>
                                    <Input id="category" className="col-span-3" defaultValue={selectedEvent.category} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="fee" className="text-right">Fee</Label>
                                    <Input id="fee" type="number" step="0.01" className="col-span-3" defaultValue={selectedEvent.registration_fee} />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                // Implement edit logic here
                                setEditDialogOpen(false);
                            }}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Event</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this event?</p>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => {
                                // Implement delete logic here
                                setDeleteDialogOpen(false);
                            }}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Event</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-name" className="text-right">Name</Label>
                                <Input id="new-name" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-date" className="text-right">Date</Label>
                                <Input id="new-date" type="date" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-location" className="text-right">Location</Label>
                                <Input id="new-location" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-category" className="text-right">Category</Label>
                                <Input id="new-category" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-fee" className="text-right">Fee</Label>
                                <Input id="new-fee" type="number" step="0.01" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                // Implement create logic here
                                setCreateDialogOpen(false);
                            }}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
