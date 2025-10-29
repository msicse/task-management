import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { useState } from "react";
import {
  ClockIcon,
  DocumentArrowUpIcon,
  UserGroupIcon,
  FunnelIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { formatMinutesDisplay, exactTooltip } from '@/utils/timeFormat';

export default function Index({ auth, activities, activityCategories, users, departments, queryParams = null, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  queryParams = queryParams || {};

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route("activity-monitor.index"), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      if (queryParams.sort_direction === "asc") {
        queryParams.sort_direction = "desc";
      } else {
        queryParams.sort_direction = "asc";
      }
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("activity-monitor.index"), queryParams);
  };

  const formatDurationFromSessions = (activity) => {
    // real_time_duration might be in minutes (integer). If zero, try to compute from session timestamps for short sessions.
    let minutesFloat = Number(activity.real_time_duration) || 0;
    if (minutesFloat === 0 && activity.sessions && activity.sessions.length > 0) {
      // try to compute from the most recent session that has timestamps
      const s = activity.sessions.find(sess => sess.started_at && sess.ended_at) || activity.sessions[0];
      if (s && s.started_at && s.ended_at) {
        minutesFloat = ((new Date(s.ended_at)) - (new Date(s.started_at))) / (1000 * 60);
      }
    }

    return formatMinutesDisplay(minutesFloat);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'started':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Team Activity Monitor
          </h2>
          <Link
            href={route("activities.index")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            View All Activities
          </Link>
        </div>
      }
    >
      <Head title="Team Activity Monitor" />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-6 rounded-lg mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Active</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{activities?.data?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {activities?.data?.filter(activity => activity.status === 'started').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paused</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {activities?.data?.filter(activity => activity.status === 'paused').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {new Set(activities?.data?.map(activity => activity.user?.id)).size || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Team Activities</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor all running and paused activities across your team</p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.user_id}
                    onChange={(e) => searchFieldChanged("user_id", e.target.value)}
                  >
                    <option value="">All Users</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.category_id}
                    onChange={(e) => searchFieldChanged("category_id", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {activityCategories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.status}
                    onChange={(e) => searchFieldChanged("status", e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="started">Running</option>
                    <option value="paused">Paused</option>
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.department_id}
                    onChange={(e) => searchFieldChanged("department_id", e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments?.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => router.get(route("activity-monitor.index"))}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="overflow-auto">
                {activities.data.length > 0 ? (
                  <div className="grid gap-4">
                    {activities.data.map((activity) => (
                      <div key={activity.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Activity Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(activity.status)}`}>
                                <ClockIcon className="w-4 h-4 mr-2" />
                                {activity.status === 'started' ? 'Running' : 'Paused'}
                              </span>
                              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {activity.activity_category?.name}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <UserGroupIcon className="w-4 h-4 mr-2" />
                                {activity.user?.name}
                              </span>
                              {activity.user?.department && (
                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  {activity.user.department.name}
                                </span>
                              )}
                            </div>

                            {activity.description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {activity.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                Duration: {formatDurationFromSessions(activity)}
                              </div>
                              {activity.files?.length > 0 && (
                                <div className="flex items-center">
                                  <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                                  {activity.files.length} file(s)
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                Started: {new Date(activity.created_at).toLocaleDateString()} {new Date(activity.created_at).toLocaleTimeString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                Updated: {new Date(activity.updated_at).toLocaleDateString()} {new Date(activity.updated_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <div className="flex-shrink-0">
                            <Link
                              href={route("activities.show", activity.id)}
                              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <ClockIcon className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Active Activities
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      There are currently no running or paused activities to display.
                    </p>
                  </div>
                )}
              </div>

              {activities?.meta?.links && <Pagination links={activities.meta.links} />}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
