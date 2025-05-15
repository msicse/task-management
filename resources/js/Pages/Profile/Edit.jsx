import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Information Card */}
                        <div className="p-3 sm:p-5 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                            <header className="border-b pb-3 mb-3 border-gray-200 dark:border-gray-700">
                                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">User Information</h2>
                                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                    Your account details and information.
                                </p>
                            </header>

                            <div className="mt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center mb-3">
                                        <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-300 mr-3 border-2 border-indigo-200 dark:border-indigo-700">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                                            {user.designation && (
                                                <p className="text-sm text-indigo-600 dark:text-indigo-400">{user.designation}</p>
                                            )}
                                        </div>
                                    </div>                                    <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-md mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-700 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</h4>
                                                <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                                                {mustVerifyEmail && user.email_verified_at === null && (
                                                    <span className="inline-block px-1.5 py-0.5 mt-1 text-xs text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200 rounded">
                                                        Not verified
                                                    </span>
                                                )}
                                                {user.email_verified_at && (
                                                    <span className="inline-block px-1.5 py-0.5 mt-1 text-xs text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                        {user.department && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L12 14.814l-2.419 1.419A1 1 0 018 15.414V6a1 1 0 00-1-1H4a2 2 0 01-2-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Department</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.department.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.employee_id && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee ID</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.employee_id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.phone && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                        {user.blood && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-700 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Blood Group</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.blood}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.gender && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-700 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                                            {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.location && (
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-700 dark:text-emerald-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex mt-2">
                                        <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mr-2">
                                            <div className="flex items-start">
                                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md mr-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Member Since</h4>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {user.about && (
                                            <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">About</h4>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{user.about}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Profile Form */}
                        {/* <div className="p-3 sm:p-5 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                            <header className="border-b pb-3 mb-3 border-gray-200 dark:border-gray-700">
                                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Edit Profile</h2>
                                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                    Update your personal information and preferences.
                                </p>
                            </header>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div> */}

                        <div className="p-3 sm:p-5 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <header className="border-b pb-3 mb-3 border-gray-200 dark:border-gray-700">
                            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Security</h2>
                            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                Manage your password and account security.
                            </p>
                        </header>
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                    </div>



                    {/* <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <DeleteUserForm className="max-w-xl" />
                    </div> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
