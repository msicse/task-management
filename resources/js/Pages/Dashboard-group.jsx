import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import GroupedSearchableSelect from "@/Components/GroupedSearchableSelect";
import { useState, useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  CheckIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  XMarkIcon,
  TagIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { formatMinutesDisplay, exactTooltip } from '@/utils/timeFormat';
import {
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
} from "@/constants";

export default function Dashboard({
  auth,
  totalPendingTasks,
  myPendingTasks,
  totalProgressTasks,
  myProgressTasks,
  totalCompletedTasks,
  myCompletedTasks,
  activeTasks,
  createdPendingTasks,
  createdProgressTasks,
  createdCompletedTasks,
  myCreatedTasks,
  activityCategories,
  allMainCategories,
  allCategories,
  activeActivities,
  userWorkRoles,
}) {
  // Check if user has admin role
  // Main and sub-category separation
  // Use allCategories for full grouping
  const mainCategories = (allCategories || []).filter(cat => !cat.parent_id);
  const subCategories = (allCategories || []).filter(cat => cat.parent_id);

  // Build grouped options for select
  const groupedOptions = mainCategories.map(main => ({
    label: main.name,
    options: subCategories
      .filter(sub => sub.parent_id === main.id)
      .map(sub => ({ value: String(sub.id), label: sub.name }))
  })).filter(group => group.options.length > 0);
  const isAdmin = auth.user.roles.some((role) => role.name === "Admin");
  const isAdminLeader = auth.user.roles.some(
    (role) => role.name === "Admin" || role.name === "Team Leader"
  );

  // Helper function to check if user has permission
  const hasPermission = (permission) => {
    // Check role-based permissions
    const hasRolePermission =
      auth.user?.roles?.some((role) =>
        role.permissions?.some((p) => p.name === permission)
      ) ?? false;

    return hasRolePermission;
  };

  // Calculate total tasks across all statuses
  const totalTasks =
    totalPendingTasks + totalProgressTasks + totalCompletedTasks;

  // Activity section state
  const [activityData, setActivityData] = useState({
    activity_category_id: "",
    description: "",
  });
  const [isStarting, setIsStarting] = useState(false);
  const [processingActivity, setProcessingActivity] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [showAddActivityPanel, setShowAddActivityPanel] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    activity_category_id: "",
    description: "",
  });
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  // Complete sliding panel state
  const [showCompletePanel, setShowCompletePanel] = useState(false);
  const [completeActivity, setCompleteActivity] = useState(null);
  const [completeUploadFiles, setCompleteUploadFiles] = useState([]);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeCount, setCompleteCount] = useState(1);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
        // Debug: Log allCategories and groupedOptions
        useEffect(() => {
          console.log('allCategories:', allCategories);
          console.log('mainCategories:', mainCategories);
          console.log('subCategories:', subCategories);
          console.log('groupedOptions:', groupedOptions);
        }, [allCategories]);

  // Update current time every minute for real-time duration display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Prepare category options for SearchableSelect
  const categoryOptions = activityCategories?.map(category => ({
    value: String(category.id),
    label: category.name
  })) || [];

  const handleStartActivity = async () => {
    if (!activityData.activity_category_id) {
      alert("Please select a category");
      return;
    }

    // Check if there are currently running activities
    const hasRunningActivities = activeActivities?.some(activity => activity.status === 'started');

    if (hasRunningActivities) {
      const confirmed = confirm(
        "You have currently running activities. Starting a new activity will automatically pause them. Do you want to continue?"
      );
      if (!confirmed) {
        return;
      }
    }

    setIsStarting(true);

    try {
      await router.post(route("activities.store"), {
        ...activityData,
        status: "started",
      });

      // Reset form after successful creation
      setActivityData({
        activity_category_id: "",
        description: "",
      });
    } catch (error) {
      console.error("Error starting activity:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleActivityAction = async (activityId, action) => {
    // If completing, open the sliding panel to collect files/notes/count
    if (action === 'complete') {
      const activity = activeActivities.find(a => a.id === activityId) || null;
      if (!activity) return;
      setCompleteActivity(activity);
      setCompleteUploadFiles([]);
      setCompleteNotes(activity.notes || '');
      setCompleteCount((activity.sessions && activity.sessions.length) ? activity.sessions.length : (activity.count ?? 1));
      setShowCompletePanel(true);
      return;
    }

    setProcessingActivity(activityId);
    try {
      await router.put(route(`activities.${action}`, activityId), {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Success message will be handled by Laravel session
        },
        onError: (errors) => {
          console.error(`Error ${action} activity:`, errors);
          alert(`Failed to ${action} activity. Please try again.`);
        }
      });
    } catch (error) {
      console.error(`Error ${action} activity:`, error);
      alert(`Failed to ${action} activity. Please try again.`);
    } finally {
      setProcessingActivity(null);
    }
  };

  const closeCompletePanel = () => {
    setShowCompletePanel(false);
    setCompleteActivity(null);
    setCompleteUploadFiles([]);
    setCompleteNotes('');
    setCompleteCount(1);
    setIsSubmittingComplete(false);
  }

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

  const handleFileUpload = async (activityId, files) => {
    if (!files.length) return;

    setUploadingFiles(prev => ({ ...prev, [activityId]: true }));

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files[]', file);
    });

    try {
      await router.post(route('activity-files.store', activityId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const formatDuration = (durationInMinutes) => {
    return formatMinutesDisplay(durationInMinutes);
  };

  const formatDurationFromSessions = (activity) => {
    let totalDuration = 0;

    // Add duration from completed sessions
    if (activity.sessions) {
      totalDuration = activity.sessions
        .filter(session => session.ended_at && session.duration)
        .reduce((sum, session) => sum + session.duration, 0);
    }

    // If activity is currently running, add current session duration
    if (activity.status === 'started' && activity.sessions) {
      const activeSession = activity.sessions.find(session => !session.ended_at);
      if (activeSession && activeSession.started_at) {
        const sessionStart = new Date(activeSession.started_at);
        const now = currentTime;
        const currentSessionMinutesFloat = (now - sessionStart) / (1000 * 60);
        totalDuration += currentSessionMinutesFloat;
      }
    }

    // For completed or paused activities, use the stored duration if sessions don't have duration
    if ((activity.status === 'completed' || activity.status === 'paused') && totalDuration === 0 && activity.duration) {
      totalDuration = activity.duration;
    }

    // If still no duration found, try to use real_time_duration from backend calculation
    if (totalDuration === 0 && activity.real_time_duration) {
      totalDuration = activity.real_time_duration;
    }

    return formatDuration(totalDuration);
  };

  const handleCreateNewActivity = async () => {
    if (!newActivityData.activity_category_id) {
      alert("Please select a category");
      return;
    }

    // Check if there are currently running activities
    const hasRunningActivities = activeActivities?.some(activity => activity.status === 'started');

    if (hasRunningActivities) {
      const confirmed = confirm(
        "You have currently running activities. Starting a new activity will automatically pause them. Do you want to continue?"
      );
      if (!confirmed) {
        return;
      }
    }

    setIsCreatingActivity(true);

    try {
      await router.post(route("activities.store"), {
        ...newActivityData,
        status: "started",
        redirect_to: "dashboard", // Add this to indicate we want to stay on dashboard
      }, {
        onSuccess: () => {
          // Reset form and close panel after successful creation
          setNewActivityData({
            activity_category_id: "",
            description: "",
          });
          setShowAddActivityPanel(false);
          // Reload the current page (dashboard) to show updated activities
          router.reload({ only: ['activeActivities'] });
        }
      });
    } catch (error) {
      console.error("Error creating activity:", error);
    } finally {
      setIsCreatingActivity(false);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* Role-based Activity Creation Section */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Quick Activity Start
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Start tracking your work activities instantly
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {/* System Role Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">System:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {auth.user.roles?.map(role => role.name).join(', ') || 'No roles'}
                      </span>
                    </div>
                    {/* Work Roles Badges */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Work:</span>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {userWorkRoles && userWorkRoles.length > 0 ? (
                          userWorkRoles.slice(0, 3).map((role, index) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No work roles</span>
                        )}
                        {userWorkRoles && userWorkRoles.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{userWorkRoles.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {activityCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                      <TagIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        No Categories Available
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                        No activity categories are available for your current work role(s).
                        Contact your administrator to assign activity categories to your work roles.
                      </p>
                      <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
                        Your work roles: {userWorkRoles?.map(role => role.name).join(', ') || 'No work roles assigned'}
                      </div>
                      <div className="mt-4">
                        {hasPermission("user-list") ? (
                          <a
                            href={route('users.index')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-200"
                          >
                            <UserGroupIcon className="w-4 h-4 mr-2" />
                            Manage User Assignments
                          </a>
                        ) : hasPermission("role-list") ? (
                          <a
                            href={route('work-roles.index')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-200"
                          >
                            <UserGroupIcon className="w-4 h-4 mr-2" />
                            Manage Work Role Assignments
                          </a>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Contact your administrator for access
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAddActivityPanel(true)}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Start Activity
                    </button>

                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Available categories: {activityCategories.length}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Activities Section */}
          {activeActivities?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Active Activities
              </h2>
              <div className="grid gap-4">
                {activeActivities.map((activity) => (
                  <div key={activity.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Activity Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              activity.status === 'started'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {activity.status === 'started' ? 'Running' : 'Paused'}
                            </span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {activity.activity_category?.name}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Duration: {formatDurationFromSessions(activity)}
                            {activity.files?.length > 0 && (
                              <span className="ml-4 flex items-center">
                                <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                                {activity.files.length} file(s)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {/* Pause/Resume Button */}
                          {activity.status === 'started' ? (
                            <button
                              onClick={() => handleActivityAction(activity.id, 'pause')}
                              disabled={processingActivity === activity.id}
                              className="inline-flex items-center px-3 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              <PauseIcon className="w-4 h-4 mr-1" />
                              {processingActivity === activity.id ? 'Pausing...' : 'Pause'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivityAction(activity.id, 'start')}
                              disabled={processingActivity === activity.id}
                              className="inline-flex items-center px-3 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                            >
                              <PlayIcon className="w-4 h-4 mr-1" />
                              {processingActivity === activity.id ? 'Resuming...' : 'Resume'}
                            </button>
                          )}

                          {/* Complete Button */}
                          <button
                            onClick={() => handleActivityAction(activity.id, 'complete')}
                            disabled={processingActivity === activity.id}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            {processingActivity === activity.id ? 'Completing...' : 'Complete'}
                          </button>

                          {/* File upload removed from Dashboard-group active list (use activity detail page or complete panel) */}

                          {/* Add Another Activity Button */}
                          <button
                            onClick={() => setShowAddActivityPanel(true)}
                            className="inline-flex items-center px-3 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                          >
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Another
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin-only Total Task Statistics */}
          {isAdminLeader && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                System-wide Task Statistics
              </h2>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Total Tasks in System
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Tasks */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            All Tasks
                          </p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {totalTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                          <span className="text-purple-500 dark:text-purple-300 text-xl">
                            📊
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total Pending Tasks */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {totalPendingTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <span className="text-amber-500 dark:text-amber-300 text-xl">
                            ⏱️
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {totalTasks > 0
                            ? ((totalPendingTasks / totalTasks) * 100).toFixed(
                                0
                              )
                            : 0}
                          % of all tasks
                        </p>
                      </div>
                    </div>

                    {/* Total In Progress Tasks */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            In Progress
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {totalProgressTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 dark:text-blue-300 text-xl">
                            🔄
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {totalTasks > 0
                            ? ((totalProgressTasks / totalTasks) * 100).toFixed(
                                0
                              )
                            : 0}
                          % of all tasks
                        </p>
                      </div>
                    </div>

                    {/* Total Completed Tasks */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {totalCompletedTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-500 dark:text-green-300 text-xl">
                            ✅
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {totalTasks > 0
                            ? (
                                (totalCompletedTasks / totalTasks) *
                                100
                              ).toFixed(0)
                            : 0}
                          % of all tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Task Summary
            </h2>

            {/* Task Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Tasks Assigned To Me */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Tasks Assigned To Me
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pending Tasks */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {myPendingTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <span className="text-amber-500 dark:text-amber-300 text-xl">
                            ⏱️
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (myPendingTasks / (totalPendingTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all pending tasks
                        </p>
                      </div>
                    </div>

                    {/* In Progress Tasks */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            In Progress
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {myProgressTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 dark:text-blue-300 text-xl">
                            🔄
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (myProgressTasks / (totalProgressTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all in-progress tasks
                        </p>
                      </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {myCompletedTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-500 dark:text-green-300 text-xl">
                            ✅
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (myCompletedTasks / (totalCompletedTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all completed tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Created By Me */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Tasks Created By Me
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pending Tasks Created */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {createdPendingTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <span className="text-amber-500 dark:text-amber-300 text-xl">
                            📝
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (createdPendingTasks / (totalPendingTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all pending tasks
                        </p>
                      </div>
                    </div>

                    {/* In Progress Tasks Created */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            In Progress
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {createdProgressTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 dark:text-blue-300 text-xl">
                            👨‍💻
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (createdProgressTasks / (totalProgressTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all in-progress tasks
                        </p>
                      </div>
                    </div>

                    {/* Completed Tasks Created */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {createdCompletedTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-500 dark:text-green-300 text-xl">
                            🎉
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(
                            (createdCompletedTasks /
                              (totalCompletedTasks || 1)) *
                            100
                          ).toFixed(0)}
                          % of all completed tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Tasks and Created Tasks Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Assigned Tasks Table */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Tasks Assigned To Me
                    </h3>
                    <Link
                      href={route("tasks.index", { filter: 'assigned' })}
                      className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Task
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Priority
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {activeTasks.data.length ? (
                          activeTasks.data.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {task.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {task.category?.name || "No Category"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_STATUS_CLASS_MAP[task.status]
                                  }
                                >
                                  {TASK_STATUS_TEXT_MAP[task.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_PRIORITY_CLASS_MAP[task.priority]
                                  }
                                >
                                  {TASK_PRIORITY_TEXT_MAP[task.priority]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Link
                                  href={route("tasks.show", task.id)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              No active tasks assigned to you
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* My Created Tasks Table */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Tasks Created By Me
                    </h3>
                    <Link
                      href={route("tasks.index", { filter: 'created' })}
                      className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Task
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Assignee
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {myCreatedTasks.data.length ? (
                          myCreatedTasks.data.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {task.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {task.category?.name || "No Category"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  {task.assignedUser?.name || "Unassigned"}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_STATUS_CLASS_MAP[task.status]
                                  }
                                >
                                  {TASK_STATUS_TEXT_MAP[task.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Link
                                  href={route("tasks.show", task.id)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              You haven't created any active tasks
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
                onClick={() => setShowAddActivityPanel(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Category Selection */}
              {/* Grouped Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sub-Category (Grouped by Main)
                </label>
                <GroupedSearchableSelect
                  groups={groupedOptions}
                  value={newActivityData.activity_category_id}
                  onChange={value => setNewActivityData(prev => ({ ...prev, activity_category_id: value }))}
                  placeholder="Select sub-category..."
                  searchPlaceholder="Search sub-categories..."
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
                onClick={() => setShowAddActivityPanel(false)}
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
          onClick={() => setShowAddActivityPanel(false)}
        />
      )}

      {/* Complete Sliding Panel for Dashboard */}
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${showCompletePanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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

          <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Files</label>
              <input type="file" multiple onChange={handleCompleteFileSelect} className="w-full" />
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
              <textarea value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} placeholder="Add notes (optional)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-y" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count</label>
              <input type="number" min={1} value={completeCount} onChange={e => setCompleteCount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sessions in this activity: <span className="font-medium text-gray-700 dark:text-gray-200">{completeActivity?.sessions ? completeActivity.sessions.length : 0}</span>
                {' '}• Total time: <span className="font-medium text-gray-700 dark:text-gray-200">{completeActivity ? formatDurationFromSessions(completeActivity) : '0m'}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
            <button onClick={closeCompletePanel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button onClick={submitCompletePanel} disabled={isSubmittingComplete} className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">{isSubmittingComplete ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      </div>

      {showCompletePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300" onClick={closeCompletePanel}></div>
      )}
    </AuthenticatedLayout>
  );
}
