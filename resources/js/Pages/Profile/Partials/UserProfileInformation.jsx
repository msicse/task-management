import { usePage } from '@inertiajs/react';

export default function UserProfileInformation({ className = '' }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Information</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    View your profile information.
                </p>
            </header>

            <div className="mt-6">
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <dl>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Full name</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Email address</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.email}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Designation</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.designation || 'N/A'}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Employee ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.employee_id || 'N/A'}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Phone</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.phone || 'N/A'}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Blood Group</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.blood || 'N/A'}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Gender</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}
                                </dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Location</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.location || 'N/A'}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Date of Join</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{formatDate(user.date_of_join)}</dd>
                            </div>
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Status</dt>
                                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                                    </span>
                                </dd>
                            </div>
                            {user.roles && user.roles.length > 0 && (
                                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Role</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                        {user.roles.map(role => role.name).join(', ')}
                                    </dd>
                                </div>
                            )}
                            {user.department && (
                                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Department</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                        {user.department.name}
                                    </dd>
                                </div>
                            )}
                            {user.about && (
                                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-700">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">About</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{user.about}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </section>
    );
}
