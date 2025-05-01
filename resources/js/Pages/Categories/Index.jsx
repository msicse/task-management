import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";

export default function Index({ auth, categories, queryParams = null, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  queryParams = {}

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      queryParams.sort_direction =
        queryParams.sort_direction === "asc" ? "desc" : "asc";
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("categories.index"), queryParams);
  };

  const onSearch = (term) => {
    router.get(
      route("categories.index"),
      { ...queryParams, name: term },
      {
        preserveState: true,
        preserveScroll: true,
        only: ["categories"],
      }
    );
  };


  const searchFieldChange = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route("categories.index"), queryParams);
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

    router.get(route("categories.index"), queryParams);
  };


  const deleteCategory = (category) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    router.delete(route("categories.destroy", category.id), {
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
          Categories
        </h2>
      }
    >
      <Head title="Categories" />

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
                  href={route("categories.create")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Category
                </Link>
                <TextInput
                  type="text"
                  placeholder="Search categories..."
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
                    {categories.data.map((category) => (
                      <tr
                        key={category.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-6 py-4">{category.name}</td>
                        <td className="px-6 py-4">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={route("categories.show", category.id)}
                            className="font-medium text-green-600 dark:text-green-500 hover:underline mr-3"
                          >
                            Show
                          </Link>
                          <Link
                            href={route("categories.edit", category.id)}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteCategory(category)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {categories.meta && categories.meta.links && (
                  <Pagination links={categories.meta.links} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
