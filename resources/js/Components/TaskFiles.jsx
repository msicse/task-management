import { Link } from "@inertiajs/react";
import { useState } from "react";
import { FaEye, FaDownload, FaTimes, FaTrash } from "react-icons/fa";

export default function TaskFiles({ files }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const handleDeleteClick = (fileId) => {
        setShowDeleteConfirm(fileId);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    // Function to determine if file is viewable
    const isViewable = (mimeType) => {
        const viewableMimeTypes = [
            'image/',
            'application/pdf',
            'text/',
            'application/json',
            'application/xml',
            'application/javascript',
            'application/x-javascript',
            'text/javascript',
            'text/html',
            'text/css',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/msword', // .doc
            'application/vnd.ms-excel', // .xls
            'application/vnd.ms-powerpoint' // .ppt
        ];

        return viewableMimeTypes.some(type => mimeType.startsWith(type));
    };

    return (
        <div className="space-y-4">
            {files.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    File
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Size
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Uploaded By
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {files.map((file) => (
                                <tr key={file.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                                                <i className={`fas ${file.icon} text-gray-500 dark:text-gray-400`}></i>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {file.original_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {file.mime_type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {file.size_for_humans}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {file.user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(file.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            {/* View/Preview button */}
                                            {file.mime_type && isViewable(file.mime_type) && (
                                                <button
                                                    onClick={() => handlePreview(file)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View file"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Download button */}
                                            <a
                                                href={route('task-files.download', file.id)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                title="Download file"
                                            >
                                                <FaDownload className="w-4 h-4" />
                                            </a>

                                            {/* Delete button with confirmation */}
                                            {showDeleteConfirm === file.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleCancelDelete()}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                    >
                                                        <FaTimes className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={route('task-files.destroy', file.id)}
                                                        method="delete"
                                                        as="button"
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteClick(file.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete file"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No files uploaded yet.
                </p>
            )}

            {/* File Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {previewFile.original_name}
                                </h3>
                                <Link
                                    href={route('task-files.download', previewFile.id)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    title="Download file"
                                >
                                    <FaDownload className="w-4 h-4" />
                                </Link>
                            </div>
                            <button
                                onClick={closePreview}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative" style={{ height: '70vh' }}>
                            {previewFile.mime_type.startsWith('image/') ? (
                                <img
                                    src={route('task-files.download', previewFile.id)}
                                    alt={previewFile.original_name}
                                    className="w-full h-full object-contain"
                                />
                            ) : previewFile.mime_type === 'application/pdf' ? (
                                <iframe
                                    src={route('task-files.download', previewFile.id)}
                                    className="w-full h-full"
                                    title={previewFile.original_name}
                                ></iframe>
                            ) : previewFile.mime_type.startsWith('text/') ||
                               previewFile.mime_type.includes('javascript') ||
                               previewFile.mime_type === 'application/json' ||
                               previewFile.mime_type === 'application/xml' ? (
                                <iframe
                                    src={route('task-files.download', previewFile.id)}
                                    className="w-full h-full"
                                    title={previewFile.original_name}
                                ></iframe>
                            ) : previewFile.mime_type.includes('word') ||
                               previewFile.mime_type.includes('sheet') ||
                               previewFile.mime_type.includes('presentation') ||
                               previewFile.mime_type.includes('msword') ||
                               previewFile.mime_type.includes('ms-excel') ||
                               previewFile.mime_type.includes('ms-powerpoint') ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <i className={`fas ${previewFile.icon} text-6xl mb-4 text-gray-400`}></i>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        This file type cannot be previewed directly in the browser
                                    </p>
                                    <Link
                                        href={route('task-files.download', previewFile.id)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Download to View
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <i className={`fas ${previewFile.icon} text-6xl mb-4 text-gray-400`}></i>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Preview not available for this file type
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
