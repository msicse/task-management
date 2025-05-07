import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import TableHeading from "@/Components/TableHeading";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import SearchableSelect from "@/Components/SearchableSelect";
import Pagination from "@/Components/Pagination";
import {
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
} from "@/constants";

export default function Index({
  auth,
  tasks,
  categories,
  users,
  queryParams = null,
  success,
}) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [search, setSearch] = useState(queryParams?.name || "");
  const [status, setStatus] = useState(queryParams?.status || "");
  const [priority, setPriority] = useState(queryParams?.priority || "");
  const [assignedTo, setAssignedTo] = useState(queryParams?.assigned_to || "");
  const [category, setCategory] = useState(queryParams?.category || "");
  const [sortField, setSortField] = useState(queryParams?.sort_field || "created_at");
  const [sortDirection, setSortDirection] = useState(queryParams?.sort_direction || "desc");
  const [perPage, setPerPage] = useState(queryParams?.per_page || 10);


  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("tasks.index"),
      {
        name: search,
        status,
        priority,
        assigned_to: assignedTo,
        category,
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

  const deleteTask = (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    router.delete(route("tasks.destroy", taskId), {
      preserveScroll: true,
      onSuccess: () => {
        setShowSuccess(true);
      },
    });
  };

  const sortChanged = (name) => {
    let newDirection = "asc";
    if (name === sortField) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(name);
    setSortDirection(newDirection);

    router.get(
      route("tasks.index"),
      {
        name: search,
        status,
        priority,
        assigned_to: assignedTo,
        category,
        sort_field: name,
        sort_direction: newDirection,
        per_page: perPage,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    router.get(
      route("tasks.index"),
      {
        name: search,
        status,
        priority,
        assigned_to: assignedTo,
        category,
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

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Tasks
          </h2>
          <div className="flex space-x-2">
            <Link
              href={route("tasks.reports")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Export Tasks
            </Link>
            <Link
              href={route("tasks.import")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Import Tasks
            </Link>
            <Link
              href={route("tasks.create")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Task
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Tasks" />

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
                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Filter sections with collapsible UI */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {/* Name search */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Task Name
                        </label>
                        <TextInput
                          id="name"
                          type="text"
                          placeholder="Search tasks..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Status filter */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <SelectInput
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full text-gray-800"
                          options={[
                            { value: "", label: "All Status" },
                            { value: "pending", label: "Pending" },
                            { value: "in_progress", label: "In Progress" },
                            { value: "completed", label: "Completed" }
                          ]}
                        />
                      </div>

                      {/* Priority filter */}
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <SelectInput
                          id="priority"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full text-gray-800"
                          options={[
                            { value: "", label: "All Priority" },
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" }
                          ]}
                        />
                      </div>

                      {/* Assignee filter */}
                      <div>
                        <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Assigned To
                        </label>
                        <SearchableSelect
                          id="assigned_to"
                          options={[
                            { value: "", label: "All Assignees" },
                            ...users.map((user) => ({ value: user.id, label: user.name }))
                          ]}
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          placeholder="Search assignee..."
                          isClearable
                        />
                      </div>

                      {/* Category filter */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <SearchableSelect
                          id="category"
                          options={[
                            { value: "", label: "All Categories" },
                            ...categories.map((category) => ({ value: category.id, label: category.name }))
                          ]}
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Search category..."
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Search and Reset buttons */}
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatus("");
                          setPriority("");
                          setAssignedTo("");
                          setCategory("");
                          // Submit the form with empty values to reset filters
                          router.get(
                            route("tasks.index"),
                            {
                              sort_field: sortField,
                              sort_direction: sortDirection,
                              per_page: perPage,
                            },
                            {
                              preserveState: true,
                              preserveScroll: true,
                            }
                          );
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <TableHeading
                        name="id"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        ID
                      </TableHeading>
                      <TableHeading
                        name="name"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Name
                      </TableHeading>
                      <TableHeading
                        name="category_id"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Category
                      </TableHeading>
                      {auth.user.roles?.some(role => role.name === "Admin") && (
                        <TableHeading
                          name="created_by"
                          sort_field={sortField}
                          sort_direction={sortDirection}
                          sortChanged={sortChanged}
                        >
                          Assigned By
                        </TableHeading>
                      )}
                      <TableHeading
                        name="assigned_user_id"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Assigned To
                      </TableHeading>
                      <TableHeading
                        name="status"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Status
                      </TableHeading>
                      <TableHeading
                        name="created_at"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Created At
                      </TableHeading>
                      <TableHeading sortable={false}>Time Log</TableHeading>
                      <TableHeading
                        name="completed_at"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Completed
                      </TableHeading>
                      <TableHeading
                        name="priority"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Priority
                      </TableHeading>
                      <TableHeading
                        name="due_date"
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Due Date
                      </TableHeading>
                      <TableHeading sortable={false}>Action</TableHeading>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.data.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={route("tasks.show", task.id)}
                            className="text-blue-600 hover:text-blue-900 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            {task.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.category.name}
                        </td>
                        {auth.user.roles?.some(role => role.name === "Admin") && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.createdBy.name}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.assignedUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "px-2 py-1 rounded text-white " +
                              TASK_STATUS_CLASS_MAP[task.status]
                            }
                          >
                            {TASK_STATUS_TEXT_MAP[task.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.created_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.time_log ? `${task.time_log} hours` : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.completed_at ? task.completed_at : "Not yet"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "px-2 py-1 rounded text-white " +
                              TASK_PRIORITY_CLASS_MAP[task.priority]
                            }
                          >
                            {TASK_PRIORITY_TEXT_MAP[task.priority]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(task.due_date) < new Date() ? (
                            <span className="text-red-600">Passed</span>
                          ) : (
                            task.due_date
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={route("tasks.edit", task.id)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 px-2">
                <Pagination
                  links={tasks.meta.links}
                  meta={tasks.meta}
                  routeName="tasks.index"
                  queryParams={{
                    name: search,
                    status,
                    priority,
                    assigned_to: assignedTo,
                    category,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                    per_page: perPage,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
