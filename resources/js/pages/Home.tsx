import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl font-bold">Welcome</h1>
            </div>
        </>
    );
}