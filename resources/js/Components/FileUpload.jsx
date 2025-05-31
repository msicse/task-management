import React, { useState, useRef } from 'react';
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

const FileUpload = ({ taskId }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
        files: [],
    });

    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState('');

    // Prevent default behavior
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Handle drag events
    const handleDrag = (e) => {
        preventDefaults(e);
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    // Validate file type and size
    const validateFile = (file) => {
        // Define allowed file types and max size (10MB)
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            return "File type not supported. Please upload images, PDFs, or office documents.";
        }

        if (file.size > maxSize) {
            return "File is too large. Maximum size is 10MB.";
        }

        return null;
    };

    // Handle dropped files
    const handleDrop = (e) => {
        preventDefaults(e);
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    // Handle file input change
    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    // Process the files
    const handleFiles = (newFiles) => {
        let validFiles = [];
        let hasError = false;

        for (let i = 0; i < newFiles.length; i++) {
            const error = validateFile(newFiles[i]);
            if (error) {
                setFileError(error);
                hasError = true;
                break;
            }
            validFiles.push(newFiles[i]);
        }

        if (!hasError) {
            setFileError('');
            setSelectedFiles(validFiles);
            setData('files', validFiles);
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

    // Remove a file
    const removeFile = (index) => {
        setSelectedFiles(prevFiles => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1);
            setData('files', updatedFiles);
            return updatedFiles;
        });
    };

    // Open file dialog
    const openFileDialog = () => {
        fileInputRef.current.click();
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
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={openFileDialog}
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
                            onChange={handleChange}
                            ref={fileInputRef}
                        />
                    </label>
                </div>
                <InputError message={errors.files} className="mt-2" />
            </div>

            {fileError && (
                <p className="mt-1 text-sm text-red-600">{fileError}</p>
            )}

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
};

export default FileUpload;
