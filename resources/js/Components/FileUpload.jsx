import { useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

export default function FileUpload({ taskId }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        files: [],
    });

    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setData('files', files);
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
            setData('files', files);
            e.dataTransfer.clearData();
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });

        post(route('task-files.store', taskId), formData, {
            forceFormData: true,  // Force the use of FormData
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="dropzone-file"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                            ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                            }`}
                        onDragEnter={handleDragIn}
                        onDragLeave={handleDragOut}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaCloudUploadAlt className={`w-8 h-8 mb-4 transition-colors duration-200 ${isDragging ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`} />
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
                    </label>
                </div>
                <InputError message={errors.files} className="mt-2" />
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Files:
                    </h4>
                    <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
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

            <div className="flex justify-end">
                <PrimaryButton disabled={processing || selectedFiles.length === 0}>
                    {processing ? "Uploading..." : "Upload Files"}
                </PrimaryButton>
            </div>
        </form>
    );
}
