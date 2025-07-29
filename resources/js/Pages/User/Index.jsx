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
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
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
                    className="w-48 text-gray-800"
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
                    className="w-48 text-gray-800"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </SelectInput>
                  <SelectInput
                    className="w-32 text-gray-800"
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
                        <div className="flex space-x-2">
                          <Link
                            href={route("users.show", user.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                          >
                            Show
                          </Link>
                          <Link
                            href={route("users.edit", user.id)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteUser(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
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
