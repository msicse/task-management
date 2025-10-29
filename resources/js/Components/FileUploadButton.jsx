import React, { useState } from 'react';
import { PaperClipIcon, PlusIcon } from '@heroicons/react/24/outline';
import FileUploadModal from './FileUploadModal';

export default function FileUploadButton({
  activityId,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  showIcon = true,
  modalTitle = "Upload Files to Activity"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleUploadComplete = (files) => {
    console.log('Files uploaded:', files);
    // Additional handling can be added here
  };

  // Button styling variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-0',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white border-0',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-0 dark:hover:bg-gray-700 dark:text-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          borderWidth: '0'
        }}
        className={`
          inline-flex items-center rounded-md font-medium transition-colors duration-200
          focus:outline-none active:outline-none border-0 focus:border-0 active:border-0
          focus:shadow-none active:shadow-none focus:ring-0 active:ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
      >
        {showIcon && <PaperClipIcon className="w-4 h-4 mr-1.5" />}
        {children || 'Upload Files'}
      </button>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpload={handleUploadComplete}
        activityId={activityId}
        title={modalTitle}
      />
    </>
  );
}
