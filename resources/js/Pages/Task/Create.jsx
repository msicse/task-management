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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

                            <div className="lg:col-span-1">
                                {/* File Upload Card */}
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg h-full">
                                    <div className="p-4 flex flex-col h-full">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 border-b pb-1">
                                            Attachments
                                        </h3>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-center w-full">
                                                <div
                                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                                                        isDragging
                                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                            : "border-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                                    }`}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsDragging(true);
                                                    }}
                                                    onDragEnter={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsDragging(true);
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsDragging(false);
                                                    }}                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsDragging(false);

                                                        const newFiles = Array.from(e.dataTransfer.files);

                                                        // Validate dropped files
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
                                                            alert(errorMessage);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <FaCloudUploadAlt className={`w-8 h-8 mb-4 transition-colors duration-200 ${
                                                            isDragging ? "text-indigo-500" : "text-gray-500 dark:text-gray-400"
                                                        }`} />
                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Excel, Word, PDF, or any other file (MAX. 10MB)
                                                        </p>
                                                    </div>

                                                    <input
                                                        id="dropzone-file"
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        ref={fileInputRef}
                                                    />
                                                </div>
                                            </div>
                                            <InputError message={errors.files} className="mt-2" />

                                            {selectedFiles.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Selected Files: <span className="text-indigo-600 font-bold">{selectedFiles.length}</span> file(s)
                                                    </h4>
                                                    <div className="flex justify-end mb-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedFiles([]);
                                                                setData('files', []);
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = '';
                                                                }
                                                            }}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Clear all files
                                                        </button>
                                                    </div>
                                                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                                                        {selectedFiles.map((file, index) => (
                                                            <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[80%]">
                                                                    {file.name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <FaTimes className="w-4 h-4" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
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
