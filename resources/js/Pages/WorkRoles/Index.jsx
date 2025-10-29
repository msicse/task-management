import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { useState } from "react";
import {
  FaCheck,
  FaUsers,
  FaTasks,
  FaTag,
  FaPlus,
  FaEye,
  FaTimes,
  FaList,
  FaExclamationCircle,
  FaEdit,
  FaTrash,
  FaSearch
} from "react-icons/fa";

export default function Index({ auth, workRoles, stats, queryParams = null, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [selectedWorkRole, setSelectedWorkRole] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("work-roles.index"), queryParams);
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

    router.get(route("work-roles.index"), queryParams);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Debounce search to avoid too many requests
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchFieldChanged("name", value);
    }, 500); // Wait 500ms after user stops typing
  };

  const deleteWorkRole = (workRole) => {
    if (!window.confirm("Are you sure you want to delete this work role?")) {
      return;
    }
    router.delete(route("work-roles.destroy", workRole.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Work Roles & Assignments
          </h2>
          <Link
            href={route("work-roles.create")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            Add New Work Role
          </Link>
        </div>
      }
    >
      <Head title="Work Roles" />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-6 rounded-lg mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Work Roles</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats?.totalWorkRoles || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Roles</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats?.activeWorkRoles || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <FaTasks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assignments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats?.totalAssignments || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {/* Header with integrated filters */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Work Roles Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage work roles and assign users to different activity categories</p>
                </div>

                {/* Search and Filters on the right */}
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  <div className="flex gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="w-4 h-4 text-gray-400" />
                      </div>
                      <TextInput
                        className="w-full sm:w-64 pl-10"
                        placeholder="Search work roles..."
                        defaultValue={queryParams.name}
                        onChange={handleSearchChange}
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </div>

                  </div>

                  <div className="flex gap-2">
                    <SelectInput
                      className="w-full sm:w-auto min-w-[140px]"
                      defaultValue={queryParams.status || ''}
                      onChange={(e) => searchFieldChanged("status", e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="1">Active Only</option>
                      <option value="0">Inactive Only</option>
                    </SelectInput>

                    {(queryParams.name || queryParams.status) && (
                      <button
                        onClick={() => router.get(route("work-roles.index"))}
                        className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors duration-200 flex items-center border border-gray-300 dark:border-gray-600"
                        title={queryParams.name && queryParams.status ? "Clear all filters" : queryParams.name ? "Clear search" : "Clear status filter"}
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {workRoles?.data && workRoles.data.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {workRoles.from} to {workRoles.to} of {workRoles.total} results
                    {queryParams.name && (
                      <span className="ml-2">
                        for "<span className="font-medium text-gray-900 dark:text-gray-100">{queryParams.name}</span>"
                      </span>
                    )}
                    {queryParams.status && (
                      <span className="ml-2">
                        • <span className="font-medium text-gray-900 dark:text-gray-100">
                          {queryParams.status === '1' ? 'Active only' : 'Inactive only'}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                    <tr className="text-nowrap">
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Description</th>
                      <th className="px-3 py-3">Department</th>
                      <th className="px-3 py-3">Categories</th>
                      <th className="px-3 py-3">Users</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workRoles.data && workRoles.data.length > 0 ? workRoles.data.map((workRole) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        key={workRole.id}
                      >
                        <td className="px-3 py-2">{workRole.id}</td>
                        <th className="px-3 py-2 text-nowrap">
                          {workRole.name}
                        </th>
                        <td className="px-3 py-2">
                          {workRole.description || 'No description'}
                        </td>
                        <td className="px-3 py-2">
                          {workRole.department?.name || 'No department'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {workRole.activity_categories && workRole.activity_categories.length > 0 ? (
                              <>
                                {workRole.activity_categories.slice(0, 3).map((category) => (
                                  <span
                                    key={category.id}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100"
                                  >
                                    {category.name}
                                  </span>
                                ))}
                                {workRole.activity_categories.length > 3 && (
                                  <button
                                    onClick={() => {
                                      setSelectedWorkRole(workRole);
                                      setShowCategoriesModal(true);
                                    }}
                                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 dark:bg-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
                                  >
                                    +{workRole.activity_categories.length - 3} more
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full dark:bg-gray-700 dark:text-gray-400">
                                No categories
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
                            {workRole.users_count || 0} users
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            workRole.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {workRole.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={route("work-roles.show", workRole.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                              title="View Details"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              View
                            </Link>
                            <Link
                              href={route("work-roles.edit", workRole.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 hover:border-amber-300 transition-colors duration-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30"
                              title="Edit Work Role"
                            >
                              <FaEdit className="w-3 h-3 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={(e) => deleteWorkRole(workRole)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                              title="Delete Work Role"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-4">
                            <FaExclamationCircle className="w-12 h-12 mx-auto" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No work roles found</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {queryParams.name ? 'Try adjusting your search criteria' : 'Create your first work role to get started'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {workRoles?.links && workRoles.links.length > 3 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    links={workRoles.links}
                    meta={workRoles}
                    routeName="work-roles.index"
                    queryParams={queryParams}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Modal */}
      {showCategoriesModal && selectedWorkRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Activity Categories for: {selectedWorkRole.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedWorkRole.activity_categories?.length || 0} categories assigned
                </p>
              </div>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedWorkRole.activity_categories?.map((category) => (
                  <div
                    key={category.id}
                    className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {category.description}
                      </div>
                    )}
                    <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                      <FaTag className="w-3 h-3 mr-1" />
                      ID: {category.id}
                    </div>
                  </div>
                ))}
              </div>
              {selectedWorkRole.activity_categories?.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <FaExclamationCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No categories assigned to this work role</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
