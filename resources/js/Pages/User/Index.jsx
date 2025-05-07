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
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                    className="w-48"
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
                    className="w-48"
                  >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                  </SelectInput>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Search
                  </button>
                </form>
              </div>

              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <TableHeading
                      name="name"
                      shortable={true}
                      short_field={sortField}
                      short_direction={sortDirection}
                      shortChanged={sortChanged}
                    >
                      Name
                    </TableHeading>
                    <TableHeading
                      name="email"
                      shortable={true}
                      short_field={sortField}
                      short_direction={sortDirection}
                      shortChanged={sortChanged}
                    >
                      Email
                    </TableHeading>
                    <TableHeading
                      name="department_id"
                      shortable={true}
                      short_field={sortField}
                      short_direction={sortDirection}
                      shortChanged={sortChanged}
                    >
                      Department
                    </TableHeading>
                    <TableHeading
                      name="status"
                      shortable={true}
                      short_field={sortField}
                      short_direction={sortDirection}
                      shortChanged={sortChanged}
                    >
                      Status
                    </TableHeading>
                    <TableHeading
                      name="role"
                      shortable={true}
                      short_field={sortField}
                      short_direction={sortDirection}
                      shortChanged={sortChanged}
                    >
                      Role
                    </TableHeading>
                    <TableHeading shortable={false}>Actions</TableHeading>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.data.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image && (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={`/storage/${user.image}`}
                              alt={user.name}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.employee_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.department ? user.department.name : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.roles && user.roles.length > 0
                          ? user.roles[0].name
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4">
                <Pagination links={users.links} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
