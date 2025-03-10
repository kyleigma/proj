import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type PaginationState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { ArrowUpDown, ChevronDown, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';


    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

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
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center space-x-2">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedEvent(table.getFilteredSelectedRowModel().rows[0]?.original || null)}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Event Details</DialogTitle>
                            </DialogHeader>
                            {selectedEvent && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Event Name</Label>
                                        <div className="col-span-3">{selectedEvent.name}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="date" className="text-right">Date</Label>
                                        <div className="col-span-3">{new Date(selectedEvent.event_date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="time" className="text-right">Time</Label>
                                        <div className="col-span-3">{new Date(`2000-01-01T${selectedEvent.event_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="location" className="text-right">Location</Label>
                                        <div className="col-span-3">{selectedEvent.location}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="category" className="text-right">Category</Label>
                                        <div className="col-span-3">{selectedEvent.category || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="distance" className="text-right">Distance</Label>
                                        <div className="col-span-3">{selectedEvent.distance ? `${selectedEvent.distance} km` : 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="fee" className="text-right">Registration Fee</Label>
                                        <div className="col-span-3">{selectedEvent.registration_fee ? `$${selectedEvent.registration_fee.toFixed(2)}` : 'Free'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <div className="col-span-3" className="capitalize">{selectedEvent.status}</div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Status
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Email
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Amount
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const payment = row.original;
                return (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedPayment(payment)}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Event Name</Label>
                                        <div className="col-span-3">{selectedEvent.name}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="date" className="text-right">Date</Label>
                                        <div className="col-span-3">{new Date(selectedEvent.event_date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="time" className="text-right">Time</Label>
                                        <div className="col-span-3">{new Date(`2000-01-01T${selectedEvent.event_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="location" className="text-right">Location</Label>
                                        <div className="col-span-3">{selectedEvent.location}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="category" className="text-right">Category</Label>
                                        <div className="col-span-3">{selectedEvent.category || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="distance" className="text-right">Distance</Label>
                                        <div className="col-span-3">{selectedEvent.distance ? `${selectedEvent.distance} km` : 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="fee" className="text-right">Registration Fee</Label>
                                        <div className="col-span-3">{selectedEvent.registration_fee ? `$${selectedEvent.registration_fee.toFixed(2)}` : 'Free'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <div className="col-span-3" className="capitalize">{selectedEvent.status}</div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            },
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Page',
            href: '/table',
        }
    ];

    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    );

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <Input
                        placeholder="Search events..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('name')?.setFilterValue(event.target.value)
                        }
                        className="w-full md:max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto md:ml-0">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="w-full overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </p>
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
                </div>
            </div>
        </AppLayout>
    );
}



    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

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
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Event Name
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'event_date',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Date
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue('event_date'));
                return date.toLocaleDateString();
            },
        },
        {
            accessorKey: 'event_time',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Time
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const time = row.getValue('event_time');
                return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            },
        },
        {
            accessorKey: 'location',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Location
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Category
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'registration_fee',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Fee
                    <Icon iconNode={ArrowUpDown} className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const fee = row.getValue('registration_fee');
                return fee ? `$${fee.toFixed(2)}` : 'Free';
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Event Details</DialogTitle>
                            </DialogHeader>
                            {selectedEvent && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Event Name</Label>
                                        <div className="col-span-3">{selectedEvent.name}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="date" className="text-right">Date</Label>
                                        <div className="col-span-3">{new Date(selectedEvent.event_date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="time" className="text-right">Time</Label>
                                        <div className="col-span-3">{new Date(`2000-01-01T${selectedEvent.event_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="location" className="text-right">Location</Label>
                                        <div className="col-span-3">{selectedEvent.location}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="category" className="text-right">Category</Label>
                                        <div className="col-span-3">{selectedEvent.category || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="distance" className="text-right">Distance</Label>
                                        <div className="col-span-3">{selectedEvent.distance ? `${selectedEvent.distance} km` : 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="fee" className="text-right">Registration Fee</Label>
                                        <div className="col-span-3">{selectedEvent.registration_fee ? `$${selectedEvent.registration_fee.toFixed(2)}` : 'Free'}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <div className="col-span-3 capitalize">{selectedEvent.status}</div>
                                    </div>
                                    {selectedEvent.description && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">Description</Label>
                                            <div className="col-span-3">{selectedEvent.description}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            },
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Events',
            href: '/events',
        }
    ];
}