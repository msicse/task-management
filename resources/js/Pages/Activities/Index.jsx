import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import TableHeading from "@/Components/TableHeading";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import Pagination from "@/Components/Pagination";
import { formatDateTime, formatDate } from "@/utils/dateFormat";
import {
  ACTIVITY_STATUS_CLASS_MAP,
  ACTIVITY_STATUS_TEXT_MAP
} from "@/constants";
import {
  PlayIcon,
  PauseIcon,
  CheckIcon,
  EyeIcon,
  PencilIcon,
  PaperClipIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import FileUploadButton from "@/Components/FileUploadButton";
import { formatMinutesDisplay, exactTooltip } from '@/utils/timeFormat';

export default function Index({
  auth,
  activities,
  categories,
  assignedCategories = [],
  filters = {},
  permissions = {},
  success
}) {
  // Debug: log activities payload so we can verify 'notes' presence
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('Activities page payload (activities):', activities);
    } catch (e) {}
  }, [activities]);
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [status, setStatus] = useState(filters?.status || "");
  const [startDate, setStartDate] = useState(filters?.start_date || "");
  const [endDate, setEndDate] = useState(filters?.end_date || "");
  const [categoryId, setCategoryId] = useState(filters?.category_id || "");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [externalUpdateToast, setExternalUpdateToast] = useState(false);
  // View scope: 'mine' or 'all'
  // Determine initial scope more precisely:
  // - If filters.user_id is present and equals the current user -> 'mine'
  // - If filters.user_id is present and differs -> 'all'
  // - If no filter provided, privileged users default to 'all', others to 'mine'
  let initialViewScope = 'mine';
  if (filters?.user_id) {
    initialViewScope = String(filters.user_id) === String(auth.user.id) ? 'mine' : 'all';
  } else {
    initialViewScope = permissions.canSeeAllActivities ? 'all' : 'mine';
  }
  const [viewScope, setViewScope] = useState(initialViewScope);

  // Sliding panel state
  const [showAddActivityPanel, setShowAddActivityPanel] = useState(false);
  // Complete sliding panel state (to match Dashboard behaviour)
  const [showCompletePanel, setShowCompletePanel] = useState(false);
  const [completeActivity, setCompleteActivity] = useState(null);
  const [completeUploadFiles, setCompleteUploadFiles] = useState([]);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeCount, setCompleteCount] = useState(1);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    activity_category_id: "",
    description: "",
  });
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);

  // Separate main and sub-categories
  const mainCategories = categories?.filter(cat => !cat.parent_id) || [];
  const subCategories = categories?.filter(cat => cat.parent_id) || [];
  // If backend provided assignedCategories (array of ids), limit sub-categories to those
  // that the current user has access to. However, if the user is viewing 'all' scope
  // and has permission, show all sub-categories so admins can create/view across all.
  const assignedCategoryIds = Array.isArray(assignedCategories) ? assignedCategories.map(String) : [];
  let allowedSubCategories;
  if (viewScope === 'all' && permissions.canSeeAllActivities) {
    allowedSubCategories = subCategories;
  } else {
    allowedSubCategories = (assignedCategoryIds.length > 0)
      ? subCategories.filter(sub => assignedCategoryIds.includes(String(sub.id)))
      : subCategories;
  }

  // State for selected main category in the sliding panel
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  // Filtered sub-categories based on main category selection
  // By default only show sub-categories (same behaviour as Dashboard) so users
  // cannot accidentally pick a main category which would fail access checks.
  const filteredSubCategories = selectedMainCategory
    ? allowedSubCategories.filter(sub => sub.parent_id === Number(selectedMainCategory))
    : allowedSubCategories;

  // Fix: Define categoryOptions for MultipleSearchableSelect
  const categoryOptions = categories?.map(cat => ({ value: String(cat.id), label: cat.name })) || [];

  // Function to format duration from activity data
  const formatActivityDuration = (activity) => {
    // First try to use the total_duration from backend
    if (activity.total_duration && activity.total_duration !== '0m') {
      return activity.total_duration;
    }

    // Fallback: calculate from sessions if available (support fractional minutes for short sessions)
    if (activity.sessions && activity.sessions.length > 0) {
      let totalMinutes = 0;
      activity.sessions.forEach(session => {
        if (session.duration && session.duration > 0) {
          totalMinutes += Number(session.duration);
        } else if (session.started_at && session.ended_at) {
          // compute precise minutes from timestamps for short durations
          const started = new Date(session.started_at);
          const ended = new Date(session.ended_at);
          totalMinutes += (ended - started) / (1000 * 60);
        }
      });

      if (totalMinutes > 0) {
        return formatMinutesDisplay(totalMinutes);
      }
    }

    // Final fallback: use stored duration
    if (activity.duration) {
      return formatMinutesDisplay(activity.duration);
    }

    return '0m';
  };

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    // If user lacks permission to see all activities, always keep scope to 'mine'
    if (!permissions.canSeeAllActivities) {
      setViewScope('mine');
    }
  }, [success]);

  const changeScope = (scope) => {
    if (scope === viewScope) return;
    // Non-privileged users cannot switch to 'all'
    if (scope === 'all' && !permissions.canSeeAllActivities) return;

    setViewScope(scope);
    const params = { ...filters };
    if (scope === 'mine') {
      params.user_id = auth.user.id;
    } else {
      // remove user_id to view all
      delete params.user_id;
    }

    router.get(route('activities.index'), params, { preserveState: true });
  };

  // Listen for cross-tab activity updates (set by Dashboard or other pages)
  useEffect(() => {
    const handler = (e) => {
      if (!e) return;
      const key = e.key || null;
      if (key === 'activities_updated') {
        // show a small toast then reload the activities partial
        setExternalUpdateToast(true);
        setTimeout(() => {
          try {
            router.reload({ only: ['activities'] });
          } catch (err) {
            router.reload();
          }
        }, 800);
        // hide toast in case reload is delayed
        setTimeout(() => setExternalUpdateToast(false), 3000);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const searchFieldChanged = (name, value) => {
    const params = { ...filters };
    if (value) {
      params[name] = value;
    } else {
      delete params[name];
    }

    router.get(route("activities.index"), params);
  };

  const sortChanged = (name) => {
    const direction = name === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(name);
    setSortDirection(direction);

    const params = {
      ...filters,
      sort_field: name,
      sort_direction: direction
    };

    router.get(route("activities.index"), params);
  };

  const clearFilters = () => {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setCategoryId("");
    router.get(route("activities.index"));
  };

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    searchFieldChanged("category_id", value);
  };

  const handleStatusAction = (activity, action) => {
    if (action === 'complete') {
      // open sliding panel to allow files/notes/count before completing
      setCompleteActivity(activity);
      setCompleteUploadFiles([]);
      setCompleteNotes(activity.notes || '');
      // Prefill count with number of sessions if available
      setCompleteCount((activity.sessions && activity.sessions.length) ? activity.sessions.length : (activity.count ?? 1));
      setShowCompletePanel(true);
      return;
    }

    const actionRoutes = {
      start: "activities.start",
      pause: "activities.pause",
    };

    router.put(route(actionRoutes[action], activity.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Signal other tabs/pages that activities updated
        try { localStorage.setItem('activities_updated', Date.now().toString()); } catch(e) {}
      }
    });
  };

  const closeCompletePanel = () => {
    setShowCompletePanel(false);
    setCompleteActivity(null);
    setCompleteUploadFiles([]);
    setCompleteNotes('');
    setCompleteCount(1);
    setIsSubmittingComplete(false);
  };

  const handleCompleteFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setCompleteUploadFiles(files);
  };

  const handleRemoveCompleteFile = (index) => {
    setCompleteUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitCompletePanel = async () => {
    if (!completeActivity) return;
    setIsSubmittingComplete(true);

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('count', completeCount);
    if (completeNotes && completeNotes.trim() !== '') {
      formData.append('notes', completeNotes.trim());
    }
    completeUploadFiles.forEach((f) => formData.append('files[]', f));

    try {
      await router.post(route('activities.complete', completeActivity.id), formData, {
        onSuccess: () => {
          closeCompletePanel();
          try { localStorage.setItem('activities_updated', Date.now().toString()); } catch (e) {}
          try { router.reload({ only: ['activities'] }); } catch (e) { /* ignore reload errors */ }
        },
        onError: () => {
          // keep panel open so user can retry
        }
      });
    } catch (err) {
      console.error('Failed to submit complete:', err);
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const deleteActivity = (activity) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    router.delete(route("activities.destroy", activity.id));
  };

  const handleCreateNewActivity = async () => {
    if (!newActivityData.activity_category_id) {
      return;
    }

    setIsCreatingActivity(true);

    try {
      const payload = {
        ...newActivityData,
        status: "started",
        redirect_to: "activities",
      };

      // Debug: log payload before sending
      console.log('Creating activity with payload:', payload);

      await router.post(route("activities.store"), payload, {
        preserveScroll: true,
        onSuccess: () => {
          // Reset form and close panel
          setNewActivityData({
            activity_category_id: "",
            description: "",
          });
          setSelectedMainCategory("");
          setShowAddActivityPanel(false);
          // Reload to show updated activities
          router.reload({ only: ['activities'] });
        },
        onError: (errors) => {
          // Show validation/server errors so user can paste them here
          console.error('Server returned errors when creating activity:', errors);
          try {
            const msg = JSON.stringify(errors);
            alert('Failed to start activity. See console for details.\n' + msg);
          } catch (e) {
            alert('Failed to start activity. Check console for details.');
          }
        }
      });
    } catch (error) {
      console.error("Error creating activity:", error);
    } finally {
      setIsCreatingActivity(false);
    }
  };

  const closeAddActivityPanel = () => {
    setShowAddActivityPanel(false);
    setNewActivityData({ activity_category_id: "", description: "" });
    setSelectedMainCategory("");
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Activities
            </h2>
            <div className="mt-1">
              {permissions.canSeeAllActivities ? (
                <div className="inline-flex items-center rounded-md border bg-white dark:bg-gray-800">
                  <button
                    onClick={() => changeScope('mine')}
                    className={`px-3 py-1 text-sm ${viewScope === 'mine' ? 'bg-indigo-600 text-white rounded-l' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    My Activities
                  </button>
                  <button
                    onClick={() => changeScope('all')}
                    className={`px-3 py-1 text-sm ${viewScope === 'all' ? 'bg-indigo-600 text-white rounded-r' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    All Activities
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">Viewing: My activities</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {permissions.canImportActivities && (
              <Link
                href={route('activities.import')}
                className="bg-yellow-500 py-2 px-3 text-white rounded shadow transition-all hover:bg-yellow-600 inline-flex items-center"
              >
                Import
              </Link>
            )}

            <button
              onClick={() => setShowAddActivityPanel(true)}
              className="bg-emerald-500 py-2 px-3 text-white rounded shadow transition-all hover:bg-emerald-600 inline-flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Activity
            </button>
          </div>
        </div>
      }
    >
      <Head title="Activities" />

      <div className="py-2">
        {externalUpdateToast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-600 text-white px-4 py-2 rounded shadow">Activities updated — reloading...</div>
          </div>
        )}
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <Alert
              type="success"
              message={success}
              onClose={() => setShowSuccess(false)}
            />
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Filters
                </h3>
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FunnelIcon className="w-4 h-4 mr-1" />
                  {isFilterExpanded ? "Hide" : "Show"} Filters
                </button>
              </div>

              {isFilterExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <MultipleSearchableSelect
                      options={categoryOptions}
                      value={categoryId}
                      onChange={handleCategoryChange}
                      placeholder="Select Category..."
                      searchPlaceholder="Search categories..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <SelectInput
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        searchFieldChanged("status", e.target.value);
                      }}
                      className="w-full"
                    >
                      <option value="">All Status</option>
                      <option value="started">Started</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </SelectInput>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <TextInput
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        searchFieldChanged("start_date", e.target.value);
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <TextInput
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        searchFieldChanged("end_date", e.target.value);
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="bg-gray-500 py-2 px-4 text-white rounded shadow transition-all hover:bg-gray-600 w-full"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {activities?.data?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                        <tr className="text-nowrap">
                          <TableHeading
                            name="description"
                            sort_field={sortField}
                            sort_direction={sortDirection}
                            sortChanged={sortChanged}
                          >
                            Activity
                          </TableHeading>
                          <th className="px-3 py-3">Category</th>
                          <th className="px-3 py-3">User</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Duration</th>
                          <th className="px-3 py-3">Count</th>
                          <TableHeading
                            name="started_at"
                            sort_field={sortField}
                            sort_direction={sortDirection}
                            sortChanged={sortChanged}
                          >
                            Started At
                          </TableHeading>
                          <th className="px-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities?.data?.map((activity) => (
                          <tr
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            key={activity.id}
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center">
                                <div className="font-medium flex-1">
                                    {activity.description || "No description"}
                                    {activity.notes && (
                                      <div className="text-xs text-gray-500 mt-1 truncate">
                                        Notes: {activity.notes}
                                      </div>
                                    )}
                                  </div>
                                {activity.files && activity.files.length > 0 && (
                                  <div className="ml-2 flex items-center">
                                    <PaperClipIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs text-gray-500 ml-1">
                                      {activity.files.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {activity.activity_category?.name || "N/A"}
                            </td>
                            <td className="px-3 py-2">
                              {activity.user?.name}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full text-white ${
                                  ACTIVITY_STATUS_CLASS_MAP[activity.status]
                                }`}
                              >
                                {ACTIVITY_STATUS_TEXT_MAP[activity.status]}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {formatActivityDuration(activity)}
                            </td>
                            <td className="px-3 py-2">
                              {activity.count ?? 0}
                            </td>
                            <td className="px-3 py-2 text-nowrap">
                              {activity.started_at
                                ? formatDateTime(activity.started_at)
                                : "Not started"
                              }
                            </td>
                            <td className="px-3 py-2 text-nowrap text-right">
                              <div className="flex justify-end space-x-1">
                                <Link
                                  href={route("activities.show", activity.id)}
                                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline p-1"
                                  title="View Activity"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </Link>

                                {activity.status !== "completed" && (
                                  <>
                                    {activity.status === "started" ? (
                                      <button
                                        onClick={() => handleStatusAction(activity, "pause")}
                                        className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline p-1"
                                        title="Pause Activity"
                                      >
                                        <PauseIcon className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleStatusAction(activity, "start")}
                                        className="font-medium text-green-600 dark:text-green-500 hover:underline p-1"
                                        title="Start Activity"
                                      >
                                        <PlayIcon className="w-4 h-4" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleStatusAction(activity, "complete")}
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline p-1"
                                      title="Complete Activity"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                <FileUploadButton
                                  activityId={activity.id}
                                  variant="outline"
                                  size="sm"
                                  className="!p-1 !text-gray-600 dark:!text-gray-400 hover:!text-blue-600 dark:hover:!text-blue-400 !border-0 !outline-none focus:!outline-none active:!outline-none !shadow-none focus:!shadow-none active:!shadow-none !ring-0 focus:!ring-0 active:!ring-0"
                                  modalTitle={`Upload Files to "${activity.activity_category?.name || 'Activity'}"`}
                                  showIcon={true}
                                >
                                  <span className="sr-only">Upload Files</span>
                                </FileUploadButton>

                                <Link
                                  href={route("activities.edit", activity.id)}
                                  className="font-medium text-amber-600 dark:text-amber-500 hover:underline p-1"
                                  title="Edit Activity"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Link>

                                <button
                                  onClick={() => deleteActivity(activity)}
                                  className="font-medium text-red-600 dark:text-red-500 hover:underline p-1"
                                  title="Delete Activity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {(() => {
                    // Support both serialization shapes: paginator links may be at
                    // activities.links (top-level) or activities.meta.links depending on
                    // how the controller/resource formatted the response.
                    const links = activities?.links || activities?.meta?.links || null;
                    const meta = activities?.meta || null;

                    if (links && Array.isArray(links) && links.length > 0) {
                      return (
                        <Pagination
                          links={links}
                          meta={meta}
                          routeName={"activities.index"}
                          queryParams={filters}
                        />
                      );
                    }

                    return null;
                  })()}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Get started by creating your first activity.
                  </p>
                  <button
                    onClick={() => setShowAddActivityPanel(true)}
                    className="bg-emerald-500 py-2 px-4 text-white rounded shadow transition-all hover:bg-emerald-600 inline-flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Activity
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Panel for Adding New Activity */}
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
        showAddActivityPanel ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add New Activity
              </h2>
              <button
                onClick={closeAddActivityPanel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Main Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Main Category
                </label>
                <MultipleSearchableSelect
                  options={mainCategories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                  value={selectedMainCategory}
                  onChange={setSelectedMainCategory}
                  placeholder="Select main category..."
                  searchPlaceholder="Search main categories..."
                  searchable={true}
                  multiSelect={false}
                  closeOnSelect={true}
                  allowClear={true}
                  className="w-full mb-2"
                />
              </div>

              {/* Sub-Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sub-Category *
                </label>
                <MultipleSearchableSelect
                  options={filteredSubCategories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                  value={newActivityData.activity_category_id}
                  onChange={value => {
                    // Set the chosen sub-category id (string)
                    setNewActivityData(prev => ({ ...prev, activity_category_id: value }));
                    // Auto-select parent/main category when a sub-category is chosen (same behaviour as Dashboard)
                    const selectedSub = filteredSubCategories.find(cat => String(cat.id) === String(value));
                    if (selectedSub && selectedSub.parent_id) {
                      setSelectedMainCategory(String(selectedSub.parent_id));
                    }
                  }}
                  placeholder="Select sub-category..."
                  searchPlaceholder="Search sub-categories..."
                  searchable={true}
                  multiSelect={false}
                  closeOnSelect={true}
                  allowClear={true}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newActivityData.description}
                  onChange={(e) => setNewActivityData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Enter activity description..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                  rows="4"
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Starting this activity will automatically pause any currently running activities and begin tracking time immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={closeAddActivityPanel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewActivity}
                disabled={isCreatingActivity || !newActivityData.activity_category_id}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                {isCreatingActivity ? "Starting..." : "Start Activity"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {showAddActivityPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300"
          onClick={closeAddActivityPanel}
        />
      )}

      {/* Complete Sliding Panel (matches Dashboard behaviour) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${showCompletePanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete Activity</h3>
              {completeActivity && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{completeActivity.activity_category?.name || completeActivity.description}</div>
              )}
            </div>
            <button onClick={closeCompletePanel} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 px-4 py-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Files</label>
              <input type="file" multiple onChange={handleCompleteFileSelect} className="w-full text-sm" />
              {completeUploadFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{completeUploadFiles.length} file(s) selected</div>
              )}
              {completeUploadFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {completeUploadFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{f.name}</div>
                      <button onClick={() => handleRemoveCompleteFile(idx)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
              <textarea value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} placeholder="Add notes (optional)" className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none text-sm" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count</label>
              <input type="number" min={1} value={completeCount} onChange={e => setCompleteCount(Number(e.target.value))} className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sessions in this activity: <span className="font-medium text-gray-700 dark:text-gray-200">{completeActivity?.sessions ? completeActivity.sessions.length : (completeActivity ? (completeActivity.sessions ? completeActivity.sessions.length : 0) : 0)}</span>
                {' '}• Total time: <span className="font-medium text-gray-700 dark:text-gray-200">{completeActivity ? formatActivityDuration(completeActivity) : '0m'}</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
            <button onClick={closeCompletePanel} className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button onClick={submitCompletePanel} disabled={isSubmittingComplete} className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">{isSubmittingComplete ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      </div>

      {showCompletePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300" onClick={closeCompletePanel}></div>
      )}
    </AuthenticatedLayout>
  );
}
