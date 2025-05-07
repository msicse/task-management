import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";

export default function Index({ auth, categories, queryParams = {}, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [name, setName] = useState(queryParams.name || '');
  const [sortField, setSortField] = useState(queryParams.sort_field || 'created_at');
  const [sortDirection, setSortDirection] = useState(queryParams.sort_direction || 'desc');

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSearch = (e) => {
    e.preventDefault();

    router.get(route("categories.index"), {
      name,
      sort_field: sortField,
      sort_direction: sortDirection
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const sortChanged = (name) => {
    let newDirection = "asc";
    if (name === sortField) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(name);
    setSortDirection(newDirection);

    router.get(route("categories.index"), {
      name,
      sort_field: name,
      sort_direction: newDirection
    }, {
      preserveState: true,
      preserveScroll: true,
    });
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

                <form onSubmit={handleSearch} className="flex gap-4">
                  <TextInput
                    type="text"
                    placeholder="Search categories..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-64"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Search
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="text-left">
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
                        name="created_at"
                        shortable={true}
                        short_field={sortField}
                        short_direction={sortDirection}
                        shortChanged={sortChanged}
                      >
                        Created Date
                      </TableHeading>
                      <TableHeading shortable={false}>
                        Actions
                      </TableHeading>
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
                <div className="mt-4">
                  <Pagination links={categories.links} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
