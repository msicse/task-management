import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function ManageWorkRoles({ auth, user, workRoles, userWorkRoles, flash, success }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, setData, put, processing, errors } = useForm({
    work_roles: userWorkRoles.map(role => role.id) || []
  });

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm) return workRoles;
    return workRoles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [workRoles, searchTerm]);

  const handleRoleToggle = (roleId) => {
    const currentRoles = [...data.work_roles];
    if (currentRoles.includes(roleId)) {
      setData('work_roles', currentRoles.filter(id => id !== roleId));
    } else {
      setData('work_roles', [...currentRoles, roleId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("users.update-work-roles", user.id));
  };

  const handleSelectAll = () => {
    setData('work_roles', filteredRoles.map(role => role.id));
  };

  const handleDeselectAll = () => {
    setData('work_roles', []);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <AuthenticatedLayout
        user={auth.user}
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Work Roles - {user.name}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {data.work_roles.length} / {workRoles.length} assigned
            </div>
          </div>
        }
      >
        <Head title={`Manage Work Roles - ${user.name}`} />

        {/* Fixed Action Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded transition-colors whitespace-nowrap"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={route("users.index")}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 bg-white rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={processing}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Fixed Top Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Success Message */}
          {(flash?.success || success) && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{flash?.success || success}</p>
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              {filteredRoles.length} of {workRoles.length} roles shown
            </div>
          )}

          {/* Errors */}
          {errors.work_roles && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.work_roles}</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Roles Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit}>
            {/* Work Roles Grid - Compact Card Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredRoles.map((role) => {
                const isSelected = data.work_roles.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className={`relative cursor-pointer p-3 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300"
                    }`}
                    onClick={() => handleRoleToggle(role.id)}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                          checked={isSelected}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                          {role.name}
                        </div>
                        {role.description && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {role.description}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            role.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            <div className={`w-1 h-1 rounded-full mr-1 ${
                              role.is_active ? "bg-green-500" : "bg-red-500"
                            }`}></div>
                            {role.is_active ? "Active" : "Inactive"}
                          </div>
                          {isSelected && (
                            <div className="text-blue-600 dark:text-blue-400">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredRoles.length === 0 && searchTerm && (
              <div className="text-center py-6">
                <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No roles found for "{searchTerm}"</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-1 text-blue-600 hover:text-blue-700 text-xs"
                >
                  Clear search
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      </AuthenticatedLayout>
    </div>
  );
}
