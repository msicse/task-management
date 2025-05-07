import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import { BsFileEarmarkPdf, BsFiletypeXlsx, BsFilter } from "react-icons/bs";
import TaskFilters from "@/Components/Task/TaskFilters";

const Reports = ({ auth, categories, users, success }) => {
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        name: "",
        status: "",
        priority: "",
        assigned_to: "",
        category: "",
        date_range: "",
    });

    const statusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
    ];

    const priorityOptions = [
        { label: "All Priorities", value: "" },
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
    ];

    const downloadExcel = (e) => {
        e.preventDefault();

        // Build the query string from form data
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        // Redirect to the Excel export endpoint
        window.location.href = `/tasks/export/excel?${params.toString()}`;
    };

    const downloadPdf = (e) => {
        e.preventDefault();

        // Build the query string from form data
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        // Redirect to the PDF export endpoint
        window.location.href = `/tasks/export/pdf?${params.toString()}`;
    };

    const handleFilterChange = (field, value) => {
        setData({ ...data, [field]: value });
    };

    const resetFilters = () => {
        reset();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Task Reports
                </h2>
            }
        >
            <Head title="Task Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow">
                            {success}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Generate Reports
                                </h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <BsFilter className="mr-2" />
                                    {showFilters ? "Hide Filters" : "Show Filters"}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <TaskFilters
                                        data={data}
                                        onChange={handleFilterChange}
                                        onReset={resetFilters}
                                        users={users}
                                        categories={categories}
                                        statusOptions={statusOptions}
                                        priorityOptions={priorityOptions}
                                    />
                                </div>
                            )}

                            <div className="mt-8 flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/2 p-6 bg-green-50 rounded-lg border border-green-200 flex flex-col">
                                    <div className="flex items-center mb-4">
                                        <BsFiletypeXlsx className="text-green-600 text-3xl mr-3" />
                                        <h4 className="font-semibold text-lg text-gray-800">Excel Export</h4>
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        Export your tasks to an Excel spreadsheet. The data will reflect your current filter selections.
                                    </p>
                                    <div className="mt-auto">
                                        <button
                                            onClick={downloadExcel}
                                            disabled={processing}
                                            className="w-full bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex items-center justify-center"
                                        >
                                            <BsFiletypeXlsx className="mr-2" />
                                            Download Excel
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2 p-6 bg-red-50 rounded-lg border border-red-200 flex flex-col">
                                    <div className="flex items-center mb-4">
                                        <BsFileEarmarkPdf className="text-red-600 text-3xl mr-3" />
                                        <h4 className="font-semibold text-lg text-gray-800">PDF Report</h4>
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        Generate a comprehensive PDF report of your tasks. The report will include all tasks based on your filter selections.
                                    </p>
                                    <div className="mt-auto">
                                        <button
                                            onClick={downloadPdf}
                                            disabled={processing}
                                            className="w-full bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex items-center justify-center"
                                        >
                                            <BsFileEarmarkPdf className="mr-2" />
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Individual Task Reports</h4>
                                <p className="text-gray-600">
                                    You can also generate PDF reports for individual tasks by going to the task detail page and clicking the "Generate Report" button.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Reports;
