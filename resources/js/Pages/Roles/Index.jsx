import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";

export default function Index({ auth, roles, queryParams = null, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  //Must be an object
  queryParams = queryParams || {};

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const searchFieldChange = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route("roles.index"), queryParams);
  };
  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChange(name, e.target.value);
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

    router.get(route("roles.index"), queryParams);
  };

  const deleteRole = (role) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }
    router.delete(route("roles.destroy", role.id), {
      onSuccess: () => {
        setShowSuccess(true);
      },
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Roles
        </h2>
      }
    >
      <Head title="Roles" />

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
                  href={route("roles.create")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Role
                </Link>
                <TextInput
                  type="text"
                  placeholder="Search roles..."
                  defaultValue={queryParams.name}
                  onBlur={(e) => searchFieldChange("name", e.target.value)}
                  onKeyPress={(e) => onKeyPress("name", e)}
                  className="w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <TableHeading
                        name="id"
                        sort_field={queryParams.sort_field}
                        sort_direction={queryParams.sort_direction}
                        sortChanged={sortChanged}
                      >
                        ID
                      </TableHeading>
                      <TableHeading
                        name="name"
                        sort_field={queryParams.sort_field}
                        sort_direction={queryParams.sort_direction}
                        sortChanged={sortChanged}
                      >
                        Name
                      </TableHeading>
                      <TableHeading
                        name="created_at"
                        sort_field={queryParams.sort_field}
                        sort_direction={queryParams.sort_direction}
                        sortChanged={sortChanged}
                      >
                        Created At
                      </TableHeading>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {roles.data.map((role, index) => (
                      <tr key={role.id}>
                        <th className="px-3 py-2">{index + 1}</th>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(role.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={route("roles.show", role.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                          >
                            Show
                          </Link>
                          <Link
                            href={route("roles.edit", role.id)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteRole(role)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {roles.meta && roles.meta.links && (
                  <Pagination links={roles.meta.links} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
