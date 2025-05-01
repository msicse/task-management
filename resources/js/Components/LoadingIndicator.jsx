import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function LoadingIndicator() {
    const [isLoading, setIsLoading] = useState(false);
    const { isLoading: pageIsLoading } = usePage();

    useEffect(() => {
        setIsLoading(pageIsLoading);
    }, [pageIsLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex items-center justify-center">
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-700">Loading...</p>
            </div>
        </div>
    );
}
