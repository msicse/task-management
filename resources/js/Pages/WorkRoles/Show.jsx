import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import TextInput from "@/Components/TextInput";
import {
  FaUser,
  FaUsers,
  FaTasks,
  FaTag,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaPlus,
  FaMinus,
  FaSearch,
  FaInfo,
  FaCalendar,
  FaBuilding,
  FaUserPlus,
  FaUserMinus
} from "react-icons/fa";

export default function Show({ auth, workRole, users, availableUsers, queryParams = null }) {
  const [activeTab, setActiveTab] = useState('details');
  const [userSearch, setUserSearch] = useState(queryParams?.user_search || '');
  const { delete: destroy, processing } = useForm();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this work role?")) {
      destroy(route("work-roles.destroy", workRole.id));
    }
  };

  const { post } = useForm();
  const assignUser = (userId) => {
    post(route("work-roles.assign-user", { workRole: workRole.id, user: userId }));
  };

  const removeUser = (userId) => {
    post(route("work-roles.remove-user", { workRole: workRole.id, user: userId }));
  };

  const handleUserSearch = (value) => {
    setUserSearch(value);
    const params = { ...queryParams };
    if (value) {
      params.user_search = value;
    } else {
      delete params.user_search;
    }

    router.get(route("work-roles.show", workRole.id), params, {
      preserveState: true,
      replace: true,
    });
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUserSearch(e.target.value);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {workRole.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Work Role Details</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={route("work-roles.index")}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <Link
              href={route("work-roles.edit", workRole.id)}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrash className="w-4 h-4 mr-2" />
              {processing ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      }
    >
      <Head title={`Work Role: ${workRole.name}`} />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    workRole.is_active
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {workRole.is_active ? (
                      <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FaTimes className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className={`text-lg font-semibold ${
                    workRole.is_active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {workRole.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Users</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{users?.length || 0}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{workRole.activity_categories?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FaCalendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(workRole.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === 'details'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaInfo className="w-4 h-4" />
                <span>Details</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaUsers className="w-4 h-4" />
                <span>Assigned Users ({users?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === 'categories'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaTasks className="w-4 h-4" />
                <span>Activity Categories ({workRole.activity_categories?.length || 0})</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-700">
            {activeTab === 'details' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <FaInfo className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Basic Information
                      </h3>
                      <dl className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaTag className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Role Name
                            </dt>
                            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                              {workRole.name}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaInfo className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Description
                            </dt>
                            <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                              {workRole.description || 'No description provided'}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaBuilding className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Department
                            </dt>
                            <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                              {workRole.department?.name || 'No department assigned'}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <FaCalendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                        Timeline Information
                      </h3>
                      <dl className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaCalendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Created At
                            </dt>
                            <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                              {new Date(workRole.created_at).toLocaleString()}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaEdit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Last Updated
                            </dt>
                            <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                              {new Date(workRole.updated_at).toLocaleString()}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Assigned Users
                  </h3>

                  {users && users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                          <button
                            onClick={() => removeUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove user from this work role"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No users assigned to this work role yet.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Assign New Users
                    </h4>
                    <div className="w-64">
                      <TextInput
                        className="w-full"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyPress={onKeyPress}
                        onBlur={(e) => handleUserSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {availableUsers && availableUsers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                          <button
                            onClick={() => assignUser(user.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                      </div>
                      {userSearch && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                          Showing up to 20 users matching "{userSearch}". Refine your search for more specific results.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      {userSearch ? `No users found matching "${userSearch}".` : 'No users available to assign.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Activity Categories
                </h3>

                {workRole.activity_categories && workRole.activity_categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {workRole.activity_categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {category.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          ID: {category.id}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No activity categories assigned to this work role.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
