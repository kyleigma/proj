import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        const stored = localStorage.getItem('appearance');
        return (stored as Appearance) || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (appearance === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(appearance);
    }, [appearance]);

    const updateAppearance = (value: Appearance) => {
        localStorage.setItem('appearance', value);
        setAppearance(value);
    };

    return { appearance, updateAppearance };
}