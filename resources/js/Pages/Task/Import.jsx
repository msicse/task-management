import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import InputError from "@/Components/InputError";
import { FaFileExcel, FaCloudUploadAlt, FaSpinner, FaDownload } from "react-icons/fa";

export default function Import({ auth, errors, success }) {
    const [fileName, setFileName] = useState(null);
    const { data, setData, post, processing, reset } = useForm({
        file: null,
    });
    const [showErrors, setShowErrors] = useState(!!Object.keys(errors).length);
    const [showSuccess, setShowSuccess] = useState(!!success);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setData("file", file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.import.process"), {
            onSuccess: () => {
                reset();
                setFileName(null);
            },
        });
    };

    const downloadTemplate = () => {
        // Generate CSV template
        const headers = "name,description,category,assigned_user,status,priority,due_date,factory_id\n";
        const sampleRow = "Task Name,Task Description,Project Management,john.doe@example.com,pending,medium,2025-05-31,TASK123\n";

        // Create a file from the CSV data
        const blob = new Blob([headers + sampleRow], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        // Create a link and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task_import_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Import Tasks
                    </h2>
                    <div>
                        <Link
                            href={route("tasks.index")}
                            className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-200"
                        >
                            Back to Tasks
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Import Tasks" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {showSuccess && (
                        <Alert
                            type="success"
                            message={success}
                            onClose={() => setShowSuccess(false)}
                            className="mb-6"
                        />
                    )}

                    {showErrors && Object.keys(errors).length > 0 && (
                        <Alert
                            type="error"
                            message={Object.values(errors).flat().join(" ")}
                            onClose={() => setShowErrors(false)}
                            className="mb-6"
                        />
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Bulk Task Import
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Upload an Excel or CSV file to import multiple tasks at once. Your file should include the following columns:
                                </p>
                                <ul className="list-disc ml-5 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li>name - Task name (required)</li>
                                    <li>description - Task description</li>
                                    <li>category - Category name (required, must match an existing category)</li>
                                    <li>assigned_user - User's name or email (required, must match an existing user)</li>
                                    <li>status - Task status (pending, in_progress, completed)</li>
                                    <li>priority - Task priority (low, medium, high)</li>
                                    <li>due_date - Due date (YYYY-MM-DD format)</li>
                                    <li>factory_id - Optional factory ID</li>
                                </ul>

                                <button
                                    onClick={downloadTemplate}
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <FaDownload className="mr-2" />
                                    Download Template
                                </button>
                            </div>

                            <div className="border-t pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300">
                                            Upload File
                                        </label>
                                        <div className="mt-1 flex items-center">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                <span className="flex items-center">
                                                    <FaFileExcel className="mr-2 text-green-600" />
                                                    {fileName || "Select Excel or CSV file"}
                                                </span>
                                                <input
                                                    id="file-upload"
                                                    name="file"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                    accept=".xlsx,.xls,.csv"
                                                />
                                            </label>
                                        </div>
                                        <InputError message={errors.file} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-end mt-6">
                                        <button
                                            type="submit"
                                            disabled={!data.file || processing}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCloudUploadAlt className="mr-2" />
                                                    Import Tasks
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}