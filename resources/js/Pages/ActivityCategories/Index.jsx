import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect, useMemo, useRef } from "react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TableHeading from "@/Components/TableHeading";
import SearchableDropdown from "@/Components/SearchableDropdown";

export default function Index({ auth, categories = { data: [], meta: null, links: [] }, parentCategories = [], departments = [], queryParams = {}, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [name, setName] = useState(queryParams.name || '');
  const [parentFilter, setParentFilter] = useState(queryParams.parent_filter || '');
  const [departmentFilter, setDepartmentFilter] = useState(queryParams.department_filter || '');
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

    router.get(route("activity-categories.index"), {
      name,
      parent_filter: parentFilter,
      department_filter: departmentFilter,
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

    router.get(route("activity-categories.index"), {
      name,
      parent_filter: parentFilter,
      department_filter: departmentFilter,
      sort_field: sortField,
      sort_direction: sortDirection,
      per_page: newPerPage
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleParentFilterChange = (newParentFilter, displayText = '') => {
    setParentFilter(newParentFilter);

    router.get(route("activity-categories.index"), {
      name,
      parent_filter: newParentFilter,
      department_filter: departmentFilter,
      sort_field: sortField,
      sort_direction: sortDirection,
      per_page: perPage
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDepartmentFilterChange = (newDepartmentFilter, displayText = '') => {
    setDepartmentFilter(newDepartmentFilter);

    router.get(route("activity-categories.index"), {
      name,
      parent_filter: parentFilter,
      department_filter: newDepartmentFilter,
      sort_field: sortField,
      sort_direction: sortDirection,
      per_page: perPage
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

    router.get(route("activity-categories.index"), {
      name,
      parent_filter: parentFilter,
      department_filter: departmentFilter,
      sort_field: fieldName,
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
    router.delete(route("activity-categories.destroy", category.id), {
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
            Activity Categories
          </h2>
          <div className="flex gap-3">
            <Link
              href={route("activity-categories.create")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              Create Category
            </Link>
            <Link
              href={route("activity-categories.import.form")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              📥 Import Categories
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Activity Categories" />

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
              <div className="mb-6">
                <form onSubmit={handleSearch} className="flex justify-end gap-4">
                  <TextInput
                    type="text"
                    placeholder="Search categories..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-64"
                  />

                  <SearchableDropdown
                    options={departments}
                    value={departmentFilter}
                    onChange={handleDepartmentFilterChange}
                    placeholder="Filter by department..."
                    displayKey="name"
                    valueKey="id"
                    className="min-w-40 max-w-48"
                    customOptions={[
                      {
                        value: '',
                        displayText: '',
                        label: 'All Departments',
                        className: 'text-gray-600 dark:text-gray-400'
                      }
                    ]}
                    renderOption={(dept) => `${dept.name} (${dept.short_name})`}
                    renderSelected={(value, options) => {
                      if (!value) return '';
                      const dept = options?.find(d => d.id == value);
                      return dept ? `${dept.name} (${dept.short_name})` : '';
                    }}
                    emptyMessage="No departments found"
                  />

                  <SearchableDropdown
                    options={parentCategories}
                    value={parentFilter}
                    onChange={handleParentFilterChange}
                    placeholder="Filter by parent..."
                    displayKey="name"
                    valueKey="id"
                    className="min-w-40 max-w-48"
                    customOptions={[
                      {
                        value: '',
                        displayText: '',
                        label: 'All Categories',
                        className: 'text-gray-600 dark:text-gray-400'
                      },
                      {
                        value: 'no_parent',
                        displayText: 'Top Level Only',
                        label: 'Top Level Only',
                        className: 'text-gray-900 dark:text-gray-200'
                      }
                    ]}
                    renderOption={(parent) => `Children of ${parent.name}`}
                    renderSelected={(value, options) => {
                      if (value === 'no_parent') return 'Top Level Only';
                      if (!value) return '';
                      const parent = options?.find(cat => cat.id == value);
                      return parent ? `Children of ${parent.name}` : '';
                    }}
                    emptyMessage="No parent categories found"
                  />
                  <SelectInput
                    className="w-32 text-gray-800 z-10"
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
                      <TableHeading sortable={false}>
                        Parent Category
                      </TableHeading>
                      <TableHeading sortable={false}>
                        Code
                      </TableHeading>
                      <TableHeading
                        name="standard_time"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Standard Time
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
                        Activities Count
                      </TableHeading>
                      <TableHeading sortable={false}>
                        Actions
                      </TableHeading>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.data && categories.data.length > 0 ? (
                      categories.data.map((category) => (
                        <tr
                          key={category.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </td>
                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {category.parent.name}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Top Level</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {category.code ? (
                            <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">
                              {category.code}
                            </code>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {category.standard_time ? `${category.standard_time} min` : 'Not set'}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {category.activities_count ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={route("activity-categories.show", category.id)}
                            className="font-medium text-green-600 dark:text-green-500 hover:underline mr-3"
                          >
                            Show
                          </Link>
                          <Link
                            href={route("activity-categories.edit", category.id)}
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
                    ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            {categories?.data && Array.isArray(categories.data) ? (
                              <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c1.381 0 2.721-.087 4-.252" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No categories</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {name || parentFilter ? 'No categories match your current filters.' : 'Get started by creating a new activity category.'}
                                </p>
                                {!name && !parentFilter && (
                                  <div className="mt-6">
                                    <Link
                                      href={route("activity-categories.create")}
                                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                      </svg>
                                      New Category
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                                <p className="mt-2 text-sm">Loading categories...</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {categories?.meta && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {categories?.meta?.from || 0} to {categories?.meta?.to || 0} of {categories?.meta?.total || 0} entries
                    </div>
                    <Pagination
                      links={categories?.links || []}
                      meta={categories?.meta}
                      routeName="activity-categories.index"
                      queryParams={{ name, parent_filter: parentFilter, department_filter: departmentFilter, sort_field: sortField, sort_direction: sortDirection, per_page: perPage }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
