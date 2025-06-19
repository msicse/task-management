import TaskForm2 from "./Partials/TaskForm2";
import { useForm, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TaskForm3 from "./Partials/TaskForm3";
import { useState, useRef } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { FaCloudUploadAlt, FaTimes, FaFileAlt, FaSpinner } from "react-icons/fa";
import FileUpload from "@/Components/FileUpload";


export default function Create({ auth, users, categories }) {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, errors, processing, reset } = useForm({
        name: "",
        status: "pending",
        description: "",
        due_date: "",
        assigned_user_id: "",
        factory_id: "",
        category_id: "",
        priority: "medium",
        files: [],
    });

    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB limit

        // Check file size
        if (file.size > maxSize) {
            return `File ${file.name} is too large (max 10MB)`;
        }

        return null; // No error
    };    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        // Validate each file
        let valid = true;
        let errorMessage = '';

        for (let i = 0; i < newFiles.length; i++) {
            const error = validateFile(newFiles[i]);
            if (error) {
                valid = false;
                errorMessage = error;
                break;
            }
        }

        if (valid) {
            // Append new files to existing files instead of replacing them
            const updatedFiles = [...selectedFiles, ...newFiles];
            setSelectedFiles(updatedFiles);
            setData('files', updatedFiles);
        } else {
            // Show error message
            alert(errorMessage);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        // Create FormData to handle files
        const formData = new FormData();

        // Add all task fields to FormData
        Object.keys(data).forEach(key => {
            if (key !== 'files') {
                formData.append(key, data[key] || '');
            }
        });

        // Add files to FormData - using the correct format for Laravel
        if (selectedFiles && selectedFiles.length) {
            // Use files[] format for array handling in Laravel
            selectedFiles.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
        }

        console.log("Submitting task with data:", Object.fromEntries(formData));

        // Submit the form with files
        post(route("tasks.store"), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Show success message or redirect
                console.log('Task created successfully');
                router.visit(route("tasks.index"));
            },
            onError: (errors) => {
                // Log errors to help with debugging
                console.error('Form submission errors:', errors);

                // If we have specific file errors, display them
                if (errors.files || errors['files.0']) {
                    alert('File upload error: ' + (errors.files || errors['files.0']));
                }
            }
        });
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Add New Task
                    </h2>
                    <div>
                        <button
                            onClick={() => router.visit(route("tasks.index"))}
                            className="px-4 py-1 bg-red-500 text-gray-200 rounded-md hover:bg-red-700 transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Create Task" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={onSubmit} encType="multipart/form-data">
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                <strong className="font-bold">Validation errors:</strong>
                                <ul className="mt-1 list-disc list-inside text-sm">
                                    {Object.keys(errors).map(key => (
                                        <li key={key}>{key}: {errors[key]}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="grid grid-cols gap-4">
                            <div className="lg:col-span-2">
                                {/* Task Details Card */}
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-4">
                                    <div className="p-4">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 border-b pb-1">
                                            Task Details
                                        </h3>
                                        <TaskForm3
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            onSubmit={e => e.preventDefault()}
                                            users={users}
                                            categories={categories}
                                            hideSubmitButton={true}
                                            compactHeight={true}
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-4">
                            <div className="p-3 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium flex items-center text-sm"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
