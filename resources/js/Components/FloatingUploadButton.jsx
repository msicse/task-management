import React, { useState } from 'react';
import { PlusIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import FileUploadModal from './FileUploadModal';

export default function FloatingUploadButton({
  activities = [],
  className = '',
  position = 'bottom-right' // bottom-right, bottom-left, top-right, top-left
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  const handleUploadComplete = (files) => {
    console.log('Files uploaded to activity:', selectedActivityId, files);
  };

  // Position classes
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={openModal}
        className={`
          fixed z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white
          rounded-full shadow-lg hover:shadow-xl transition-all duration-200
          flex items-center justify-center group
          ${positions[position]}
          ${className}
        `}
        title="Quick File Upload"
      >
        <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Enhanced Modal with Activity Selection */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpload={handleUploadComplete}
        activityId={selectedActivityId}
        title="Quick File Upload"
        customContent={() => (
          <>
            {/* Activity Selection */}
            {activities.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Activity (Optional)
                </label>
                <select
                  value={selectedActivityId || ''}
                  onChange={(e) => setSelectedActivityId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="">Select an activity...</option>
                  {activities.slice(0, 10).map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.activity_category?.name || 'Unknown'}
                      {activity.description && ` - ${activity.description.substring(0, 30)}${activity.description.length > 30 ? '...' : ''}`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Files will be attached to the selected activity
                </p>
              </div>
            )}
          </>
        )}
      />
    </>
  );
}
