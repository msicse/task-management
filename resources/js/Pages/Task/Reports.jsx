import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import DateInput from "@/Components/DateInput";
import SelectInput from "@/Components/SelectInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function Reports({ auth, filters, users, categories, departments = [], summary, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [exporting, setExporting] = useState(false);

  const { data, setData, get } = useForm({
    start_date: filters?.start_date || "",
    end_date: filters?.end_date || "",
    assigned_user_id: filters?.assigned_user_id || "",
    created_by: filters?.created_by || "",
    category_id: filters?.category_id || "",
    status: filters?.status || "",
    priority: filters?.priority || "",
    filter: filters?.filter || "my",
  });

  // Check if user has permission to see all tasks
  const hasPermission = (permission) => {
    const hasRolePermission = auth.user?.roles?.some((role) =>
      role.permissions?.some((p) => p.name === permission)
    ) ?? false;
    return hasRolePermission;
  };

  const canSeeAllTasks = hasPermission("task-list");

  // Clear team-specific filters when switching to 'my' view
  useEffect(() => {
    if (data.filter === 'my') {
      // Clear filters that don't make sense for 'my' view
      if (data.assigned_user_id || data.created_by) {
        setData({
          ...data,
          assigned_user_id: "",
          created_by: ""
        });
      }
    }
  }, [data.filter]);

  // Prepare options for MultipleSearchableSelect
  const userOptions = users?.map(user => ({
    value: String(user.id),
    label: user.name
  })) || [];

  const categoryOptions = categories?.map(category => ({
    value: String(category.id),
    label: category.name
  })) || [];

  const applyFilters = (e) => {
    e.preventDefault();
    // useForm.get automatically sends current form data as query params
    get(route("tasks.reports", { filter: data.filter }), { preserveState: true, preserveScroll: true });
  };

  const clearFilters = () => {
    // Reset all form data to empty values
    setData({
      start_date: "",
      end_date: "",
      assigned_user_id: "",
      created_by: "",
      category_id: "",
      status: "",
      priority: "",
    });

    // Navigate to reports page without any filters
    router.get(route("tasks.reports"), {}, {
      preserveState: false,
      preserveScroll: true,
    });
  };

  const exportToExcel = () => {
    const queryParams = new URLSearchParams({
      start_date: data.start_date,
      end_date: data.end_date,
      assigned_user_id: data.assigned_user_id || "",
      created_by: data.created_by || "",
      category_id: data.category_id || "",
      status: data.status || "",
      priority: data.priority || "",
      filter: data.filter,
    }).toString();

    const url = `/tasks/export/excel?${queryParams}`;
    window.open(url, '_blank');
  };

  const exportToPDF = () => {
    setExporting(true);
    const queryParams = new URLSearchParams({
      start_date: data.start_date,
      end_date: data.end_date,
      assigned_user_id: data.assigned_user_id || "",
      created_by: data.created_by || "",
      category_id: data.category_id || "",
      status: data.status || "",
      priority: data.priority || "",
      filter: data.filter,
    }).toString();

    const url = `/tasks/export/pdf?${queryParams}`;
    window.open(url, '_blank');

    setTimeout(() => setExporting(false), 2000); // Reset after 2 seconds
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Task Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.filter === 'all' && canSeeAllTasks ? 'Viewing all team tasks' : 'Viewing your tasks'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200">
              📁 Export Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? '⏳ Generating PDF...' : '📄 Export PDF'}
            </button>
          </div>
        </div>
      }
    >
      <Head title="Task Reports" />
      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <Alert message={success} type="success" onClose={() => setShowSuccess(false)} />
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              {/* View Toggle - Only show if user can see all tasks */}
              {canSeeAllTasks && (
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Reports View
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="my"
                        checked={data.filter === 'my'}
                        onChange={(e) => setData('filter', e.target.value)}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">My Tasks</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={data.filter === 'all'}
                        onChange={(e) => setData('filter', e.target.value)}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">All Team Tasks</span>
                    </label>
                  </div>
                </div>
              )}

              <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
                  <DateInput value={data.start_date} onChange={(e) => setData("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">End Date</label>
                  <DateInput value={data.end_date} onChange={(e) => setData("end_date", e.target.value)} />
                </div>
                {canSeeAllTasks && data.filter === 'all' && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Assigned User</label>
                    <MultipleSearchableSelect
                      options={userOptions}
                      value={data.assigned_user_id}
                      onChange={(value) => setData("assigned_user_id", value)}
                      placeholder="All Users"
                      searchPlaceholder="Search users..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      allowClear={true}
                      className="w-full"
                    />
                  </div>
                )}
                {canSeeAllTasks && data.filter === 'all' && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Created By</label>
                    <MultipleSearchableSelect
                      options={userOptions}
                      value={data.created_by}
                      onChange={(value) => setData("created_by", value)}
                      placeholder="All Users"
                      searchPlaceholder="Search users..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      allowClear={true}
                      className="w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Category</label>
                  <MultipleSearchableSelect
                    options={categoryOptions}
                    value={data.category_id}
                    onChange={(value) => setData("category_id", value)}
                    placeholder="All Categories"
                    searchPlaceholder="Search categories..."
                    searchable={true}
                    multiSelect={false}
                    closeOnSelect={true}
                    allowClear={true}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Status</label>
                  <SelectInput
                    value={data.status}
                    onChange={(e) => setData("status", e.target.value)}
                    className="w-full"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </SelectInput>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Priority</label>
                  <SelectInput
                    value={data.priority}
                    onChange={(e) => setData("priority", e.target.value)}
                    className="w-full"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </SelectInput>
                </div>
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors duration-200">Apply</button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-semibold text-blue-600">{summary?.total_tasks ?? 0}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-semibold text-yellow-600">{summary?.in_progress ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-semibold text-green-600">{summary?.completed ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-semibold text-red-600">{summary?.pending ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
    );
}
