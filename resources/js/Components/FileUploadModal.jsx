import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperClipIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import ActivityFileUpload from './ActivityFileUpload';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  activityId = null,
  title = "Upload Files",
  maxFiles = 5,
  maxSize = 10
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (activityId) {
        // Upload files to specific activity
        const totalFiles = selectedFiles.length;

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append('file', file);

          const uploadUrl = route('activity-files.store', activityId);
          console.log('Uploading to:', uploadUrl, 'File:', file.name);

          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
          }

          // Update progress
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        }
      }

      // Call the onUpload callback if provided
      if (onUpload) {
        await onUpload(selectedFiles);
      }

      // Reset and close
      setSelectedFiles([]);
      setUploadProgress(0);
      onClose();

      // Show success message
      alert('Files uploaded successfully!');

      // Reload page to show new files
      window.location.reload();

    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={handleClose}
                        disabled={isUploading}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                        <PaperClipIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                        {title}
                      </Dialog.Title>
                    </div>

                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Uploading files...
                            </span>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {uploadProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* File Upload Component */}
                      <div className={isUploading ? 'opacity-50 pointer-events-none' : ''}>
                        <ActivityFileUpload
                          files={selectedFiles}
                          onChange={handleFilesChange}
                          onRemove={handleRemoveFile}
                          maxFiles={maxFiles}
                          maxSize={maxSize}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                          disabled={isUploading}
                        />
                      </div>

                      {/* Upload Info */}
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                          📁 Upload Guidelines
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Maximum {maxFiles} files per upload</li>
                          <li>• Up to {maxSize}MB per file</li>
                          <li>• Supports images, documents, archives</li>
                          <li>• Files will be attached to this activity</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <PrimaryButton
                          onClick={handleUpload}
                          disabled={selectedFiles.length === 0 || isUploading}
                          className="flex-1 flex items-center justify-center"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}
                            </>
                          )}
                        </PrimaryButton>

                        <SecondaryButton
                          onClick={handleClose}
                          disabled={isUploading}
                          className="px-4"
                        >
                          Cancel
                        </SecondaryButton>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
