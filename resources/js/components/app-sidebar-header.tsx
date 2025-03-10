import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { ThemeToggle } from './theme-toggle';
import { mainNavItems } from '@/config/navigation';
import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@/components/ui/icon';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage();
    const currentItem = mainNavItems.find(item => item.url === page.url);

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <nav className="hidden md:flex items-center">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </nav>
            </div>
            <ThemeToggle />
        </header>
    );
}
