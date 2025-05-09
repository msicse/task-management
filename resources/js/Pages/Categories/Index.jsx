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
  const [perPage, setPerPage] = useState(queryParams.per_page || '10');

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
      sort_direction: sortDirection,
      per_page: perPage
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handlePerPageChange = (e) => {
    const newPerPage = e.target.value;
    setPerPage(newPerPage);

    router.get(route("categories.index"), {
      name,
      sort_field: sortField,
      sort_direction: sortDirection,
      per_page: newPerPage
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const sortChanged = (fieldName) => {
    let newDirection = "asc";
    if (fieldName === sortField) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(fieldName);
    setSortDirection(newDirection);

    router.get(route("categories.index"), {
      name, // This is the search term
      sort_field: fieldName, // This is the column to sort by
      sort_direction: newDirection,
      per_page: perPage
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
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="text-left">
                      <TableHeading
                        name="name"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Name
                      </TableHeading>
                      <TableHeading
                        name="created_at"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Created Date
                      </TableHeading>
                      <TableHeading sortable={false}>
                        Tasks Count
                      </TableHeading>
                      <TableHeading sortable={false}>
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
                          {category.tasks_count}
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
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {categories.meta.from || 0} to {categories.meta.to || 0} of {categories.meta.total} entries
                  </div>
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
