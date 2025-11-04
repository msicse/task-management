import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import ActivityFileUpload from "@/Components/ActivityFileUpload";
import PrimaryButton from "@/Components/PrimaryButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function CreateManual({ auth, categories, assignedCategories = [], permissions = {}, users = [] }) {
  const { data, setData, post, errors, processing } = useForm({
    activity_category_id: "",
    description: "",
    started_at: "",
    ended_at: "",
    duration: "",
    count: 1,
    user_id: auth.user.id,
    notes: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [userCategories, setUserCategories] = useState(categories);
  const [userAssignedCategories, setUserAssignedCategories] = useState(assignedCategories);

  // Fetch categories when user changes
  useEffect(() => {
    if (data.user_id && data.user_id !== auth.user.id && permissions?.canCreateManual) {
      setLoadingCategories(true);

      // Fetch user-specific categories
      window.axios.get(route('api.users.assigned-categories', data.user_id))
        .then(response => {
          setUserCategories(response.data.categories);
          setUserAssignedCategories(response.data.assignedCategories);

          // Reset selected category if it's no longer available for the new user
          const availableCategoryIds = permissions?.canCreateManual
            ? response.data.categories.map(cat => cat.id)
            : response.data.assignedCategories;

          if (data.activity_category_id && !availableCategoryIds.includes(Number(data.activity_category_id))) {
            setData('activity_category_id', '');
            setSelectedMainCategory('');
          }
        })
        .catch(error => {
          console.error('Error fetching user categories:', error);
          // Fallback to initial categories
          setUserCategories(categories);
          setUserAssignedCategories(assignedCategories);
        })
        .finally(() => {
          setLoadingCategories(false);
        });
    } else if (data.user_id === auth.user.id) {
      // Reset to current user's categories
      setUserCategories(categories);
      setUserAssignedCategories(assignedCategories);
    }
  }, [data.user_id]);

  // Separate main and sub-categories
  // Main categories are those without a parent_id. Sub-categories have a parent_id.
  const mainCategories = userCategories?.filter((cat) => !cat.parent_id) || [];
  const subCategories = userCategories?.filter((cat) => cat.parent_id) || [];

  // Filtered sub-categories based on main category selection
  let filteredSubCategories = selectedMainCategory
    ? subCategories.filter((sub) => sub.parent_id === Number(selectedMainCategory))
    : subCategories;

  // If the user does NOT have the manual-create permission, restrict
  // sub-categories to those assigned to the selected user's work roles.
  if (!permissions?.canCreateManual) {
    const allowedIds = (userAssignedCategories || []).map((id) => Number(id));
    filteredSubCategories = filteredSubCategories.filter((sub) => allowedIds.includes(Number(sub.id)));
  } else {
    // If user has manual-create permission but we're creating for a specific user,
    // filter to show only that user's assigned categories
    if (data.user_id && data.user_id !== auth.user.id) {
      const allowedIds = (userAssignedCategories || []).map((id) => Number(id));
      filteredSubCategories = filteredSubCategories.filter((sub) => allowedIds.includes(Number(sub.id)));
    }
  }

  const closeAddActivityPanel = () => {
    setShowAddActivityPanel(false);
    setNewActivityData({ activity_category_id: "", description: "" });
    setSelectedMainCategory("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Prepare form data with files
    const formData = {
      ...data,
      files: selectedFiles
    };

    post(route("activities.store-manual"), formData, {
      forceFormData: true,
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate duration when dates change
  const calculateDuration = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMs = end - start;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes >= 0) {
        setData('duration', diffMinutes);
      }
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setData('started_at', newStartDate);
    if (data.ended_at) {
      calculateDuration(newStartDate, data.ended_at);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setData('ended_at', newEndDate);
    if (data.started_at) {
      calculateDuration(data.started_at, newEndDate);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={route("activities.index")}
              className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Add Manual Activity
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Record past activities</p>
        </div>
      }
    >
      <Head title="Add Manual Activity" />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={onSubmit} className="p-4 sm:p-6">
              {/* Compact Info Banner */}

              {/* Compact Grid Layout */}
              <div className="space-y-4 mb-4">
                {/* Row: Left half = User + Main (side-by-side), Right half = Sub-Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Left half: nested grid with User and Main Category side-by-side */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* User selector / display */}
                      <div>
                        <InputLabel htmlFor="user_id" value="User" className="text-sm" />
                        {permissions?.canCreateManual ? (
                          <MultipleSearchableSelect
                            options={(users || []).map((u) => ({ value: String(u.id), label: `${u.name}${u.employee_id ? ' — ' + u.employee_id : ''}` }))}
                            value={String(data.user_id)}
                            onChange={(value) => setData('user_id', value)}
                            placeholder="Select user..."
                            searchPlaceholder="Search users..."
                            searchable={true}
                            multiSelect={false}
                            closeOnSelect={true}
                            allowClear={false}
                            className="mt-1 mb-2"
                          />
                        ) : (
                          <div className="mt-1">
                            <TextInput
                              id="user_display"
                              type="text"
                              name="user_display"
                              value={`${auth.user.name}${auth.user.employee_id ? ' — ' + auth.user.employee_id : ''}`}
                              className="block w-full text-sm bg-gray-100 dark:bg-gray-800"
                              disabled
                            />
                          </div>
                        )}
                      </div>

                      {/* Main Category */}
                      <div>
                        <InputLabel htmlFor="main_category" value="Main Category" className="text-sm" />
                        <MultipleSearchableSelect
                          options={mainCategories.map((cat) => ({
                            value: String(cat.id),
                            label: cat.name,
                          }))}
                          value={selectedMainCategory}
                          onChange={setSelectedMainCategory}
                          placeholder="Select main category..."
                          searchPlaceholder="Search main categories..."
                          searchable={true}
                          multiSelect={false}
                          closeOnSelect={true}
                          allowClear={true}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right half: Sub-Category full height */}
                  <div>
                    <InputLabel htmlFor="activity_category_id" value="Sub-Category *" className="text-sm" />
                    {loadingCategories ? (
                      <div className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        Loading categories...
                      </div>
                    ) : (
                      <MultipleSearchableSelect
                        options={filteredSubCategories.map((cat) => ({
                          value: String(cat.id),
                          label: cat.name,
                        }))}
                        value={data.activity_category_id}
                        onChange={(value) => {
                          setData("activity_category_id", value);
                          // Auto-select parent category if sub-category is chosen
                          const selectedSub = filteredSubCategories.find(
                            (cat) => String(cat.id) === String(value)
                          );
                          if (selectedSub && selectedSub.parent_id) {
                            setSelectedMainCategory(String(selectedSub.parent_id));
                          }
                        }}
                        placeholder={loadingCategories ? "Loading..." : "Select sub-category..."}
                        searchPlaceholder="Search sub-categories..."
                        searchable={true}
                        multiSelect={false}
                        closeOnSelect={true}
                        allowClear={true}
                        className="mt-1"
                        disabled={loadingCategories}
                      />
                    )}
                    <InputError message={errors.activity_category_id} className="mt-1" />
                    {!loadingCategories && filteredSubCategories.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        No sub-categories available for the selected user
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date & Time */}
                  <div>
                    <InputLabel htmlFor="started_at" value="Start Date & Time *" className="text-sm" />
                    <TextInput
                      id="started_at"
                      type="datetime-local"
                      name="started_at"
                      value={data.started_at}
                      className="mt-1 block w-full text-sm"
                      onChange={handleStartDateChange}
                    //   max={new Date().toISOString().slice(0, 16)}
                    />
                    <InputError message={errors.started_at} className="mt-1" />
                  </div>

                  {/* End Date & Time */}
                  <div>
                    <InputLabel htmlFor="ended_at" value="End Date & Time" className="text-sm" />
                    <TextInput
                      id="ended_at"
                      type="datetime-local"
                      name="ended_at"
                      value={data.ended_at}
                      className="mt-1 block w-full text-sm"
                      onChange={handleEndDateChange}
                      min={data.started_at}
                    />
                    <InputError message={errors.ended_at} className="mt-1" />
                  </div>

                  {/* Duration + Count (same line) */}
                  <div>
                    {/* Visual labels row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duration (min)</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Count</span>
                    </div>

                    <div className="mt-1 flex items-baseline space-x-2">
                      {/* Hidden label for accessibility */}
                      <InputLabel htmlFor="duration" value="Duration (min)" className="sr-only" />
                      <TextInput
                        id="duration"
                        type="number"
                        name="duration"
                        value={data.duration}
                        className="flex-1 text-sm"
                        onChange={(e) => setData('duration', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Auto-calculated"
                      />

                      <div className="w-24">
                        {/* Hidden label for accessibility */}
                        <InputLabel htmlFor="count" value="Count" className="sr-only" />
                        <TextInput
                          id="count"
                          type="number"
                          name="count"
                          value={data.count}
                          className="block w-full text-sm"
                          onChange={(e) => setData('count', e.target.value)}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>

                    <div className="mt-1 flex space-x-3">
                      <InputError message={errors.duration} className="mt-1" />
                      <InputError message={errors.count} className="mt-1" />
                    </div>

                    {data.duration > 0 && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor(data.duration / 60)}h {Math.floor(data.duration % 60)}m
                      </p>
                    )}
                  </div>
                </div>

                {/* Description & Notes Row - side by side (equal widths) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Description */}
                  <div>
                    <InputLabel htmlFor="description" value="Description" className="text-sm" />
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className="mt-1 block w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      placeholder="Brief description..."
                    />
                    <InputError message={errors.description} className="mt-1" />
                  </div>

                  {/* Notes */}
                  <div>
                    <InputLabel htmlFor="notes" value="Additional Notes" className="text-sm" />
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      className="mt-1 block w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                      value={data.notes}
                      onChange={(e) => setData("notes", e.target.value)}
                      placeholder="Additional information..."
                    />
                    <InputError message={errors.notes} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* File Upload - Collapsible */}
              <details className="mb-4 group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
                  <span className="mr-2">📎 Attach Files (Optional)</span>
                  <span className="text-xs text-gray-500">{selectedFiles.length > 0 && `(${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''})`}</span>
                </summary>
                <div className="mt-3 pl-2">
                  <ActivityFileUpload
                    files={selectedFiles}
                    onChange={handleFilesChange}
                    onRemove={handleRemoveFile}
                    maxFiles={10}
                    maxSize={10}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  />
                  <InputError message={errors.files} className="mt-1" />
                </div>
              </details>

              {/* Compact Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={route("activities.index")}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded inline-flex items-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition"
                >
                  Cancel
                </Link>
                <PrimaryButton
                  disabled={processing}
                  className="px-4 py-2 text-sm"
                >
                  {processing ? "Creating..." : "Create Activity"}
                </PrimaryButton>
              </div>
            </form>
          </div>

          {/* Compact Collapsible Tips */}
          <details className="mt-4">
            <summary className="cursor-pointer bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              💡 Tips & Guidelines
            </summary>
            <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div><strong>Start/End Time:</strong> When activity occurred</div>
                <div><strong>Duration:</strong> Auto-calculated or enter manually</div>
                <div><strong>Count:</strong> Track quantity (inspections, reviews, etc.)</div>
                <div><strong>Description:</strong> Brief summary of work</div>
                <div><strong>Notes:</strong> Detailed observations or context</div>
                <div><strong>Files:</strong> Supporting documents or evidence</div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
