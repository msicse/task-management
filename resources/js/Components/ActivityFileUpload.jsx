import React, { useState } from 'react';
import { PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon, FilmIcon, MusicalNoteIcon, CodeBracketIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

export default function ActivityFileUpload({ files = [], onChange, onRemove, maxFiles = 5, maxSize = 10, accept = "*/*", className = "", disabled = false }) {
    const [isDragging, setIsDragging] = useState(false);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType, fileName) => {
        if (!mimeType && fileName) {
            const ext = fileName.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                return <PhotoIcon className="w-6 h-6 text-blue-500" />;
            }
            if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
                return <FilmIcon className="w-6 h-6 text-purple-500" />;
            }
            if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
                return <MusicalNoteIcon className="w-6 h-6 text-green-500" />;
            }
            if (['js', 'jsx', 'ts', 'tsx', 'php', 'py', 'html', 'css', 'json', 'xml'].includes(ext)) {
                return <CodeBracketIcon className="w-6 h-6 text-yellow-500" />;
            }
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
                return <ArchiveBoxIcon className="w-6 h-6 text-gray-500" />;
            }
        }

        if (mimeType?.startsWith('image/')) {
            return <PhotoIcon className="w-6 h-6 text-blue-500" />;
        }
        if (mimeType?.startsWith('video/')) {
            return <FilmIcon className="w-6 h-6 text-purple-500" />;
        }
        if (mimeType?.startsWith('audio/')) {
            return <MusicalNoteIcon className="w-6 h-6 text-green-500" />;
        }
        if (mimeType?.includes('zip') || mimeType?.includes('compressed')) {
            return <ArchiveBoxIcon className="w-6 h-6 text-gray-500" />;
        }
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    };

    const handleFileSelect = (event) => {
        if (disabled) return;

        const selectedFiles = Array.from(event.target.files);
        const validFiles = [];

        selectedFiles.forEach(file => {
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
                return;
            }

            if (files.length + validFiles.length >= maxFiles) {
                alert(`Maximum ${maxFiles} files allowed.`);
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles]);
        }

        // Reset input
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = [];

        droppedFiles.forEach(file => {
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
                return;
            }

            if (files.length + validFiles.length >= maxFiles) {
                alert(`Maximum ${maxFiles} files allowed.`);
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles]);
        }
    };

    const handleRemoveFile = (index) => {
        if (disabled || !onRemove) return;
        onRemove(index);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    disabled
                        ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                        : isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="mt-4">
                    <label htmlFor="activity-file-upload" className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {disabled ? 'File upload disabled' : (
                                <>
                                    Drop files here or{' '}
                                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500">
                                        browse
                                    </span>
                                </>
                            )}
                        </span>
                        <input
                            id="activity-file-upload"
                            name="activity-file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept={accept}
                            onChange={handleFileSelect}
                            disabled={disabled}
                        />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Maximum {maxFiles} files, up to {maxSize}MB each
                    </p>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Selected Files ({files.length}/{maxFiles})
                    </h4>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center min-w-0 flex-1">
                                {getFileIcon(file.type, file.name)}
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress or Status */}
            {files.length >= maxFiles && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                    Maximum file limit reached ({maxFiles} files)
                </div>
            )}
        </div>
    );
}
