import React, { useState, useRef, useEffect } from 'react';

const TaskFileUpload = ({ onChange, multiple = false, error = null }) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [fileError, setFileError] = useState('');

    // Prevent default behavior for the entire document during drag operations
    useEffect(() => {
        const handleDocumentDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        document.addEventListener('dragenter', handleDocumentDrag);
        document.addEventListener('dragover', handleDocumentDrag);
        document.addEventListener('dragleave', handleDocumentDrag);
        document.addEventListener('drop', handleDocumentDrag);

        return () => {
            document.removeEventListener('dragenter', handleDocumentDrag);
            document.removeEventListener('dragover', handleDocumentDrag);
            document.removeEventListener('dragleave', handleDocumentDrag);
            document.removeEventListener('drop', handleDocumentDrag);
        };
    }, []);

    // Handle drop zone events
    useEffect(() => {
        const dropArea = dropAreaRef.current;
        if (!dropArea) return;

        const highlight = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
        };

        const unhighlight = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            const dt = e.dataTransfer;
            const files = dt.files;

            if (files && files.length > 0) {
                handleFiles(Array.from(files));
            }
        };

        // Event listeners
        dropArea.addEventListener('dragenter', highlight, false);
        dropArea.addEventListener('dragover', highlight, false);
        dropArea.addEventListener('dragleave', unhighlight, false);
        dropArea.addEventListener('drop', handleDrop, false);

        // Cleanup
        return () => {
            dropArea.removeEventListener('dragenter', highlight);
            dropArea.removeEventListener('dragover', highlight);
            dropArea.removeEventListener('dragleave', unhighlight);
            dropArea.removeEventListener('drop', handleDrop);
        };
    }, []);

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

    // Process files
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
            const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
            setFiles(updatedFiles);
            if (onChange) onChange(updatedFiles);
        }
    };

    // Handle file input change
    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    // Remove a file
    const removeFile = (index, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
        if (onChange) onChange(updatedFiles);
    };

    // Open file dialog
    const openFileDialog = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="file-upload-container">
            <div
                ref={dropAreaRef}
                className={`border-2 border-dashed rounded-md cursor-pointer ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                } ${error || fileError ? 'border-red-500' : ''}`}
                style={{ position: 'relative', zIndex: 50 }}
            >
                <div
                    className="flex flex-col items-center justify-center py-6"
                    onClick={openFileDialog}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        Documents and images (PDF, DOC, XLS, JPG, PNG)
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                />
            </div>

            {(error || fileError) && (
                <p className="mt-1 text-sm text-red-600">{error || fileError}</p>
            )}

            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
                    <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200 max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-2 px-4 text-sm">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => removeFile(index, e)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TaskFileUpload;
