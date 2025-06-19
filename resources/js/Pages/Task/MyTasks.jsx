import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import TableHeading from "@/Components/TableHeading";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import Pagination from "@/Components/Pagination";
import {
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
} from "@/constants";
import {
  canPerformTaskAction,
  isCreator,
  isAssigned,
} from "@/utils/permissions";
import { formatDateTime, formatDate, isPastDue, formatDateD } from "@/utils/dateFormat";

export default function MyTasks({
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
  const [sortField, setSortField] = useState(
    queryParams?.sort_field || "created_at"
  );
  const [sortDirection, setSortDirection] = useState(
    queryParams?.sort_direction || "desc"
  );
  const [perPage, setPerPage] = useState(queryParams?.per_page || 10);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("task.mytasks"),
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

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssignedTo("");
    setCategory("");

    // Reset to default sort and pagination
    setSortField("created_at");
    setSortDirection("desc");
    setPerPage(10);

    // Navigate to the route without query params
    router.get(
      route("task.mytasks"),
      {},
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
      route("task.mytasks"),
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

  // Function to toggle filter visibility
  const toggleFilters = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <Link
            href={route("task.mytasks")}
            className="hover:underline hover:text-gray-600"
          >
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Tasks
            </h2>
          </Link>
          <Link
            href={route("tasks.create")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Task
          </Link>
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
              {/* Filter Section - Redesigned */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={toggleFilters}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {isFilterExpanded ? "Hide filters" : "Show filters"}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300 flex items-center gap-1 text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>

                {isFilterExpanded && (
                  <form
                    onSubmit={handleSearch}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="search"
                          className="block text-sm font-medium"
                        >
                          Task Name
                        </label>
                        <TextInput
                          id="search"
                          type="text"
                          placeholder="Search tasks..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium"
                        >
                          Status
                        </label>
                        <SelectInput
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full text-gray-800"
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="waiting_for_approval">
                            Awaiting Approval
                          </option>
                        </SelectInput>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="priority"
                          className="block text-sm font-medium"
                        >
                          Priority
                        </label>
                        <SelectInput
                          id="priority"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full text-gray-800"
                        >
                          <option value="">All Priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </SelectInput>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="assignedTo"
                          className="block text-sm font-medium"
                        >
                          Assigned By
                        </label>
                        <SelectInput
                          id="assignedTo"
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className="w-full text-gray-800"
                        >
                          <option value="">All Assigners</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </SelectInput>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium"
                        >
                          Category
                        </label>
                        <SelectInput
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-gray-800"
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </SelectInput>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="perPage"
                          className="block text-sm font-medium"
                        >
                          Items Per Page
                        </label>
                        <SelectInput
                          id="perPage"
                          value={perPage}
                          onChange={(e) => setPerPage(e.target.value)}
                          className="w-full text-gray-800"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </SelectInput>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Apply Filters
                      </button>
                    </div>
                  </form>
                )}

                {/* Quick filter bar - visible when filters are collapsed */}
                {!isFilterExpanded && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    <div className="flex-shrink-0">
                      <TextInput
                        type="text"
                        placeholder="Quick search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 flex-shrink-0"
                    >
                      Search
                    </button>
                    {(search ||
                      status ||
                      priority ||
                      assignedTo ||
                      category) && (
                      <div className="text-sm text-gray-500">
                        <span className="mr-1">Active filters:</span>
                        {search && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs mr-1">
                            {search}
                          </span>
                        )}
                        {status && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs mr-1">
                            {status}
                          </span>
                        )}
                        {priority && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs mr-1">
                            {priority}
                          </span>
                        )}
                        {assignedTo && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs mr-1">
                            Assigned
                          </span>
                        )}
                        {category && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs mr-1">
                            Category
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* End of Filter Section */}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <TableHeading
                        name="id"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        ID
                      </TableHeading>
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
                        name="category_id"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Category
                      </TableHeading>
                      <TableHeading
                        name="created_by"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Assigned By
                      </TableHeading>
                      <TableHeading
                        name="status"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Status
                      </TableHeading>
                      <TableHeading
                        name="priority"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Priority
                      </TableHeading>
                      <TableHeading
                        name="created_at"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Created At
                      </TableHeading>
                      <TableHeading
                        name="due_date"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Due Date
                      </TableHeading>
                      <TableHeading
                        name="completed_at"
                        sortable={true}
                        sort_field={sortField}
                        sort_direction={sortDirection}
                        sortChanged={sortChanged}
                      >
                        Completed
                      </TableHeading>
                      <TableHeading sortable={false}>Time Log</TableHeading>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.createdBy.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "px-2 py-1 rounded text-white " +
                              TASK_STATUS_CLASS_MAP[
                                task.status === "completed" && !task.approved_at
                                  ? "waiting_for_approval"
                                  : task.status
                              ]
                            }
                          >
                            {
                              TASK_STATUS_TEXT_MAP[
                                task.status === "completed" && !task.approved_at
                                  ? "waiting_for_approval"
                                  : task.status
                              ]
                            }
                          </span>
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
                          {formatDateD(task.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.completed_at
                            ? formatDateD(task.completed_at)
                            : "Not yet"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.due_date && (
                            <span
                              className={
                                // If task is completed, always show the date as passed
                                isPastDue(task.due_date) || task.completed_at
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {isPastDue(task.due_date) || task.completed_at ? "passed: " : ""}
                              {formatDateD(task.due_date)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.time_log ? `${task.time_log} mins` : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={route("tasks.show", task.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            View
                          </Link>

                          {/* Only show edit button if user created the task or has admin/manager role */}
                          {(auth.user.id === task.created_by ||
                            auth.user.roles?.some((role) =>
                              ["Admin", "Manager"].includes(role.name)
                            )) && (
                            <Link
                              href={route("tasks.edit", task.id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Only show delete button if user created the task or is admin */}
                          {(auth.user.id === task.created_by ||
                            auth.user.roles?.some((role) =>
                              ["Admin"].includes(role.name)
                            )) && (
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          )}
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
                  routeName="task.mytasks"
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
