import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import {
  ArrowLeftIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function CategoryPerformance({
  auth,
  filters,
  users,
  canViewAll,
  reportData,
  summary,
  pagination,
}) {
  const [startDate, setStartDate] = useState(filters.start_date || "");
  const [endDate, setEndDate] = useState(filters.end_date || "");
  const [userId, setUserId] = useState(filters.user_id || "");
  const [perPage, setPerPage] = useState(filters.per_page || 20);

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(
      route("activities.reports.category-performance"),
      {
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        per_page: perPage,
        page: 1, // Reset to first page when applying filters
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handlePageChange = (page) => {
    router.get(
      route("activities.reports.category-performance"),
      {
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        per_page: perPage,
        page: page,
      },
      {
        preserveState: true,
        preserveScroll: false,
      }
    );
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    router.get(
      route("activities.reports.category-performance"),
      {
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        per_page: newPerPage,
        page: 1, // Reset to first page when changing per page
      },
      {
        preserveState: true,
        preserveScroll: false,
      }
    );
  };

  const handleExport = () => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      user_id: userId,
    });
    window.location.href = route("activities.reports.category-performance.export") + "?" + params.toString();
  };

  // Format minutes - keep as standard minutes
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return "0 min";
    if (minutes < 1) return `${minutes.toFixed(2)} min`;
    return `${Math.round(minutes)} min`;
  };

  // Get remark color
  const getRemarkColor = (remark) => {
    if (remark === "Above Standard") {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    } else if (remark === "Below Standard") {
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    } else if (remark === "Within Standard") {
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    } else {
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Category Performance Report
            </h2>
          </div>
        </div>
      }
    >
      <Head title="Category Performance Report" />

      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* Reports Navigation Bar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-4 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <Link
                  href={route("activities.reports")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Activity Summary
                </Link>
                <Link
                  href={route("activities.reports.category-performance")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-indigo-500 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <span className="mr-1.5">📊</span>
                  Category Performance
                </Link>
                <Link
                  href={route("activities.reports.user-visualization")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <span className="mr-1.5">📈</span>
                  User Visualization
                </Link>
              </nav>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg">
            <div className="p-6 overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filters
                  </h3>
                </div>
                {/* Export Button - Right side of Filters heading */}
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
              </div>

              <form onSubmit={handleFilter} className="space-y-4 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
                    />
                  </div>

                  {/* User Filter - only show if user can view all */}
                  {canViewAll && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User Filter
                      </label>
                      <div className="relative z-50">
                        <MultipleSearchableSelect
                          options={[
                            { value: "", label: "All Users" },
                            ...users.map((user) => ({
                              value: String(user.id),
                              label: user.employee_id
                                ? `${user.name} (${user.employee_id})`
                                : user.name,
                            })),
                          ]}
                          value={userId}
                          onChange={(value) => setUserId(value)}
                          placeholder="Select user..."
                          searchPlaceholder="Search users..."
                          searchable={true}
                          multiSelect={false}
                          closeOnSelect={true}
                          allowClear={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Per Page Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Show:
                    </label>
                    <div className="relative">
                      <select
                        value={perPage}
                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                        className="appearance-none px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm cursor-pointer"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'none'
                        }}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      per page
                    </span>
                  </div>

                  {/* Apply Filters Button - Right aligned */}
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                  <ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.total_categories}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Activities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.total_activities}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTime(summary.total_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {userId && canViewAll
                  ? "User-Filtered Category Performance"
                  : "All Sub-Categories Performance"}
              </h3>

              {reportData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available for the selected filters
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sub-Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Standard Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Performed Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Activity Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total User Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Average Performed Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Limit/Remark
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs break-words">
                            {row.sub_category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {formatTime(row.standard_time)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {formatTime(row.total_performed_time)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {row.total_activity_count}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {row.total_user_count}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {formatTime(row.average_performed_time)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRemarkColor(
                                row.limit_remark
                              )}`}
                            >
                              {row.limit_remark}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span>
                      Showing {pagination.from} to {pagination.to} of {pagination.total} categories
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {[...Array(pagination.last_page)].map((_, index) => {
                        const page = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === pagination.last_page ||
                          (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                                page === pagination.current_page
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.current_page - 2 ||
                          page === pagination.current_page + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="inline-flex items-center px-2 text-gray-500 dark:text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
