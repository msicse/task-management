import { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";
import Alert from "@/Components/Alert";
import { USER_STATUS_TEXT_MAP } from "@/constants.jsx";

export default function Index({ auth, users, departments, filters, success }) {
  const [search, setSearch] = useState(filters.search || "");
  const [department, setDepartment] = useState(filters.department || "");
  const [status, setStatus] = useState(filters.status || "");
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [sortField, setSortField] = useState(filters.sort_field || "id");
  const [sortDirection, setSortDirection] = useState(
    filters.sort_direction || "asc"
  );
  const [perPage, setPerPage] = useState(filters.per_page || "10");

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("users.index"),
      {
        search,
        department,
        status,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: perPage,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handlePerPageChange = (e) => {
    const newPerPage = e.target.value;
    setPerPage(newPerPage);

    router.get(
      route("users.index"),
      {
        search,
        department,
        status,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: newPerPage,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const sortChanged = (name) => {
    let newDirection = "asc";
    if (name === sortField) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(name);
    setSortDirection(newDirection);

    router.get(
      route("users.index"),
      {
        search,
        department,
        status,
        sort_field: name,
        sort_direction: newDirection,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const deleteUser = (user) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the user "${user.name}"?`
      )
    ) {
      return;
    }
    router.delete(route("users.destroy", user.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <Link href={route("users.index")} className="hover:underline hover:text-zinc-50">
          <h2 className="font-semibold text-xl  dark:text-gray-200 leading-tight">
            Users
          </h2>
        </Link>
      }
    >
      <Head title="Users" />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <Alert
              message={success}
              type="success"
              onClose={() => setShowSuccess(false)}
            />
          )}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <Link
                  href={route("users.create")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create User
                </Link>

                <form onSubmit={handleSearch} className="flex gap-4">
                  <TextInput
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <SelectInput
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-48 "
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </SelectInput>
                  <SelectInput
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-48 "
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </SelectInput>
                  <SelectInput
                    className="w-32 "
                    value={perPage}
                    onChange={handlePerPageChange}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </SelectInput>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <TableHeading
                        name="name"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                        className="w-1/5"
                      >
                        Name
                      </TableHeading>
                      <TableHeading
                        name="email"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                        className="w-1/5"
                      >
                        Email
                      </TableHeading>
                      <TableHeading
                        name="department_id"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                        className="w-1/6"
                      >
                        Department
                      </TableHeading>
                      <TableHeading
                        name="status"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                        className="w-1/8"
                      >
                        Status
                      </TableHeading>
                      <TableHeading
                        name="role"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                        className="w-1/8"
                      >
                        Role
                      </TableHeading>
                      <TableHeading sortable={false} className="w-1/6">Actions</TableHeading>
                    </tr>
                  </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.data.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.image && (
                            <img
                              className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                              src={`/storage/${user.image}`}
                              alt={user.name}
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.employee_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate">
                          {user.department ? user.department.name : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {USER_STATUS_TEXT_MAP[user.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate">
                          {user.roles && user.roles.length > 0
                            ? user.roles[0].name
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <Link
                            href={route("users.show", user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors duration-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                            title="View User Details"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </Link>
                          <Link
                            href={route("users.edit", user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors duration-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            title="Edit User"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={route("users.manage-work-roles", user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            title="Manage Work Roles"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Roles
                          </Link>
                          <button
                            onClick={() => deleteUser(user)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            title="Delete User"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {users.from || 0} to {users.to || 0} of {users.total || 0} entries
                </div>
                <Pagination links={users.links} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
