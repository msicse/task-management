import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";

export default function Index({
  auth,
  departments,
  queryParams = null,
  success,
}) {
  const [showSuccess, setShowSuccess] = useState(!!success);
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

    router.get(route("departments.index"), queryParams);
  };
  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChange(name, e.target.value);
  };

  const shortChanged = (name) => {
    if (name === queryParams.short_field) {
      if (queryParams.short_direction === "asc") {
        queryParams.short_direction = "desc";
      } else {
        queryParams.short_direction = "asc";
      }
    } else {
      queryParams.short_field = name;
      queryParams.short_direction = "asc";
    }

    router.get(route("departments.index"), queryParams);
  };

  const deleteDepartment = (department) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    router.delete(route("departments.destroy", department.id), {
      onSuccess: () => {
        setShowSuccess(true);
      },
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Departments
          </h2>

        </div>
      }
    >
      <Head title="Departments" />

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
                  href={route("departments.create")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Department
                </Link>
                <TextInput
                  type="text"
                  placeholder="Search Departments..."
                  defaultValue={queryParams.name}
                  onBlur={(e) => searchFieldChange("name", e.target.value)}
                  onKeyPress={(e) => onKeyPress("name", e)}
                  className="w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="text-left">
                      <th
                        className="px-6 py-3 cursor-pointer"
                        onClick={() => sortChanged("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {queryParams?.sort_field === "name" && (
                            <div>
                              {queryParams?.sort_direction === "asc"
                                ? "↑"
                                : "↓"}
                            </div>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 cursor-pointer"
                        onClick={() => sortChanged("created_at")}
                      >
                        <div className="flex items-center">
                          Created Date
                          {queryParams?.sort_field === "created_at" && (
                            <div>
                              {queryParams?.sort_direction === "asc"
                                ? "↑"
                                : "↓"}
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.data.map((department) => (
                      <tr
                        key={department.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-6 py-4">{department.name}</td>
                        <td className="px-6 py-4">
                          {new Date(department.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={route("departments.show", department.id)}
                            className="font-medium text-green-600 dark:text-green-500 hover:underline mr-3"
                          >
                            Show
                          </Link>
                          <Link
                            href={route("departments.edit", department.id)}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteDepartment(department)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {departments.meta && departments.meta.links && (
                  <Pagination links={departments.meta.links} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
