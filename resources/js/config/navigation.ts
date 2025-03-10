import { type NavItem } from '@/types';
import { LayoutGrid, Layers2, Folder, BookOpen, Table2 } from 'lucide-react';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Table',
        url: '/table',
        icon: Table2,
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];