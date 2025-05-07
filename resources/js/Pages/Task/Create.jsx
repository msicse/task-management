import TaskForm2 from "./Partials/TaskForm2";
import { useForm, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TaskForm3 from "./Partials/TaskForm3";
import { useState, useRef } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { FaCloudUploadAlt, FaTimes, FaFileAlt } from "react-icons/fa";

export default function Create({ auth, users, categories }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileErrors, setFileErrors] = useState(null);

    const { data, setData, post, errors, processing } = useForm({
        name: "",
        status: "pending",
        description: "",
        due_date: "",
        assigned_user_id: "",
        factory_id: "",
        category_id: "",
        priority: "medium",
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(files);
            e.dataTransfer.clearData();
        }
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Append all task data
        Object.keys(data).forEach(key => {
            if (data[key]) {
                formData.append(key, data[key]);
            }
        });

        // Append files if any
        if (selectedFiles.length > 0) {
            selectedFiles.forEach(file => {
                formData.append('files[]', file);
            });
        }

        post(route("tasks.store"), formData, {
            onSuccess: () => {
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setSelectedFiles([]);
            },
            onError: (errors) => {
                if (errors.files) {
                    setFileErrors(errors.files);
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
                        Create New Task
                    </h2>
                    <div>
                        <button
                            onClick={() => router.visit(route("tasks.index"))}
                            className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-200"
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
                    <form onSubmit={onSubmit}>
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
                                            <div
                                                className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out h-32
                                                    ${isDragging
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                                                    }`}
                                                onDragEnter={handleDragIn}
                                                onDragLeave={handleDragOut}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                            >
                                                <div className="flex flex-col items-center justify-center p-3">
                                                    <FaCloudUploadAlt className={`w-8 h-8 mb-2 transition-colors duration-200 ${isDragging ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`} />
                                                    <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <span className="font-semibold">Click to upload</span> or drag files
                                                    </p>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                            </div>
                                            <InputError message={fileErrors} className="mt-1" />

                                            {selectedFiles.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} Selected:
                                                    </h4>
                                                    <ul className="max-h-48 overflow-y-auto">
                                                        {selectedFiles.map((file, index) => (
                                                            <li key={index} className="flex items-center justify-between p-1 mb-1 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-xs">
                                                                <div className="flex items-center space-x-1 truncate">
                                                                    <FaFileAlt className="text-indigo-500 w-3 h-3" />
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                                                        {file.name}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                                    title="Remove file"
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
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
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
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
