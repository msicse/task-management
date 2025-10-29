import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link, router } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import ActivityFileUpload from "@/Components/ActivityFileUpload";
import PrimaryButton from "@/Components/PrimaryButton";
import { ArrowLeftIcon, XMarkIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Edit({ auth, activity, categories }) {
  // Debug: Check if data is being loaded
  console.log('Edit page - Activity:', activity);
  console.log('Edit page - Categories:', categories);

  const { data, setData, put, post, errors, processing } = useForm({
    activity_category_id: String(activity.activity_category_id || ""),
    description: activity.description || "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(activity.files || []);

  // Prepare category options for SearchableSelect
  const categoryOptions = categories?.map(category => ({
    value: String(category.id), // Ensure consistent string type
    label: category.name
  })) || [];

  // Ensure current activity's category is in the options if not present
  if (activity.activity_category && !categoryOptions.find(opt => opt.value === String(activity.activity_category_id))) {
    categoryOptions.unshift({
      value: String(activity.activity_category.id),
      label: activity.activity_category.name
    });
  }

  // SearchableSelect expects just the value, not the option object

  const handleCategoryChange = (selectedOptionOrEvent) => {
    // Handle both direct selectedOption object and wrapped event object
    let value = "";
    if (selectedOptionOrEvent && selectedOptionOrEvent.target) {
      // Event-style from SearchableSelect
      value = selectedOptionOrEvent.target.value;
    } else if (selectedOptionOrEvent && selectedOptionOrEvent.value) {
      // Direct option object
      value = selectedOptionOrEvent.value;
    }
    setData("activity_category_id", value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    console.log('Form submitted with files:', selectedFiles.length);
    console.log('Form data:', data);

    if (selectedFiles.length > 0) {
      // Create a new FormData object
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('activity_category_id', data.activity_category_id);
      formData.append('description', data.description);

      // Append each file
      selectedFiles.forEach((file, index) => {
        console.log(`Appending file ${index}:`, file.name);
        formData.append(`files[${index}]`, file);
      });

      // Use router.post with FormData
      router.post(route("activities.update", activity.id), formData, {
        preserveState: false,
        onSuccess: (page) => {
          console.log('Update successful:', page);
          setSelectedFiles([]);
        },
        onError: (errors) => {
          console.log('Update errors:', errors);
        }
      });
    } else {
      // No new files, use regular PUT request
      put(route("activities.update", activity.id));
    }
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await fetch(route('activity-files.destroy', fileId), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });

      setExistingFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center">
          <Link
            href={route("activities.show", activity.id)}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Activity
          </h2>
        </div>
      }
    >
      <Head title={`Edit Activity - ${activity.activity_category?.name || 'Unknown'}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              {/* Activity Category */}
              <div>
                <InputLabel htmlFor="activity_category_id" value="Category *" />
                <MultipleSearchableSelect
                  options={categoryOptions}
                  value={data.activity_category_id}
                  onChange={(value) => setData("activity_category_id", value)}
                  placeholder="Search and select category..."
                  searchPlaceholder="Search categories..."
                  searchable={true}
                  multiSelect={false}
                  closeOnSelect={true}
                  allowClear={true}
                  className="mt-1"
                />
                <InputError message={errors.activity_category_id} className="mt-2" />
              </div>

              {/* Description */}
              <div>
                <InputLabel htmlFor="description" value="Description" />
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  placeholder="Describe what you're working on..."
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              {/* Existing Files */}
              {existingFiles.length > 0 && (
                <div>
                  <InputLabel value="Current Files" />
                  <div className="mt-1 space-y-2">
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <DocumentIcon className="w-6 h-6 text-blue-500" />
                          <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {file.original_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {file.file_size_in_kb}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={route('activity-files.download', file.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs"
                          >
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Files */}
              <div>
                <InputLabel value="Add New Files (Optional)" />
                <div className="mt-1">
                  <ActivityFileUpload
                    files={selectedFiles}
                    onChange={handleFilesChange}
                    onRemove={handleRemoveFile}
                    maxFiles={5}
                    maxSize={10}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  />
                </div>
                <InputError message={errors.files} className="mt-2" />
              </div>

              {/* Time Tracking Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">⚠️ Note about Time Tracking</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Status and time tracking are managed automatically. Use the Start/Pause/Complete buttons on the activities list or details page to control time tracking.
                </p>
              </div>

              {/* Current Activity Info */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Current Activity Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Current Duration:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {activity.total_duration || "0m"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={route("activities.show", activity.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Cancel
                </Link>
                <PrimaryButton
                  className="ms-4"
                  disabled={processing}
                >
                  {processing ? "Saving..." : "Update Activity"}
                </PrimaryButton>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              💡 Editing Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Only category and description can be edited here</li>
              <li>• Time tracking is managed automatically through Start/Pause/Complete buttons</li>
              <li>• Change category to better organize your activities</li>
              <li>• Update description to reflect what was accomplished</li>
              <li>• Use the activity details page to control time tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
