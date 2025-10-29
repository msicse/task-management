import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import ActivityFileUpload from "@/Components/ActivityFileUpload";
import PrimaryButton from "@/Components/PrimaryButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Create({ auth, categories }) {
  const { data, setData, post, errors, processing } = useForm({
    activity_category_id: "",
    description: "",
    status: "started",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Prepare category options for SearchableSelect
  const categoryOptions = categories?.map(category => ({
    value: String(category.id), // Ensure consistent string type
    label: category.name
  })) || [];

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

    // Prepare form data with files
    const formData = {
      ...data,
      files: selectedFiles
    };

    post(route("activities.store"), formData, {
      forceFormData: true,
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center">
          <Link
            href={route("activities.index")}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create New Activity
          </h2>
        </div>
      }
    >
      <Head title="Create Activity" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Status */}
                <div>
                  <InputLabel htmlFor="status" value="Status *" />
                  <SelectInput
                    id="status"
                    name="status"
                    className="mt-1 block w-full"
                    value={data.status}
                    onChange={(e) => setData("status", e.target.value)}
                  >
                    <option value="started">Started</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </SelectInput>
                  <InputError message={errors.status} className="mt-2" />
                </div>
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

              {/* File Upload */}
              <div>
                <InputLabel value="Attach Files (Optional)" />
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

              {/* Automatic Time Tracking Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">🕐 Automatic Time Tracking</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• <strong>Started:</strong> Timer begins automatically when activity is started</li>
                  <li>• <strong>Paused:</strong> Time tracking pauses and saves current session duration</li>
                  <li>• <strong>Completed:</strong> Final duration is calculated and activity is marked complete</li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={route("activities.index")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Cancel
                </Link>
                <PrimaryButton
                  className="ms-4"
                  disabled={processing}
                >
                  {processing ? "Creating..." : "Create Activity"}
                </PrimaryButton>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              💡 Activity Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Choose "Started" to begin automatic time tracking immediately</li>
              <li>• Time tracking starts when you click "Start" and records real system time</li>
              <li>• "Paused" status stops the timer and saves your progress</li>
              <li>• "Completed" status finalizes the activity and calculates total duration</li>
              <li>• You can start, pause, and resume activities from the activities list</li>
              <li>• All timestamps are automatically captured - no manual entry needed!</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
