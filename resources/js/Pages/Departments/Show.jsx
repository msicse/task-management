import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";

export default function Show({ auth, department, success }) {
    const [showSuccess, setShowSuccess] = useState(!!success);

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
        }
    }, [success]);

    const deleteDepartment = () => {
        if (!window.confirm("Are you sure you want to delete this department?")) {
            return;
        }
        router.delete(route("departments.destroy", department.id), {
            onSuccess: () => {
                setShowSuccess(true);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Department Details
                    </h2>
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("departments.edit", department.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={deleteDepartment}
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Delete
                        </button>
                        <Link
                            href={route("departments.index")}
                            className="px-2 py-1 bg-indigo-600 text-white rounded-md transition-all hover:bg-indigo-700"
                        >
                            Back to Departments
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Department Details" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {showSuccess && success && (
                        <Alert
                            message={success}
                            type="success"
                            onClose={() => setShowSuccess(false)}
                        />
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Department Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Name</p>
                                        <p className="font-medium">{department.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Short Name</p>
                                        <p className="font-medium">{department.short_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Slug</p>
                                        <p className="font-medium">{department.slug}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Created At</p>
                                        <p className="font-medium">{new Date(department.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Users in this Department</h3>
                                {department.users && department.users.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    <th className="px-6 py-3">Name</th>
                                                    <th className="px-6 py-3">Email</th>
                                                    <th className="px-6 py-3">Created At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {department.users.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                    >
                                                        <td className="px-6 py-4">{user.name}</td>
                                                        <td className="px-6 py-4">{user.email}</td>
                                                        <td className="px-6 py-4">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No users found in this department.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
