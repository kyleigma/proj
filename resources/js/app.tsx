import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "./components/theme-provider";
import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function App({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
            {children}
        </ThemeProvider>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App: InertiaApp, props }) {
        const root = createRoot(el);

        root.render(
            <App>
                <InertiaApp {...props} />
            </App>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
