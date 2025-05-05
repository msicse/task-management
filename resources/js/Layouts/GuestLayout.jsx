import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import LoadingIndicator from '@/Components/LoadingIndicator';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
            <LoadingIndicator />
            <div>
                <Link href="/">
                    {/* <ApplicationLogo className="w-96 h-44 fill-current text-gray-500" /> */}
                    <ApplicationLogo width="280px" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
