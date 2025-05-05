import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import TableHeading from "@/Components/TableHeading";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
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
  console.log("tasks", tasks);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("tasks.index"),
      { name: search, status, priority, assigned_to: assignedTo, category },
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
          <Link
            href={route("tasks.index")}
            className="hover:underline hover:text-white"
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
              <div className="flex justify-between items-center mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <TextInput
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <SelectInput
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-48"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </SelectInput>
                  <SelectInput
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-48"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </SelectInput>
                  <SelectInput
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-48"
                  >
                    <option value="">All Assignees</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </SelectInput>
                  <SelectInput
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-48"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <TableHeading>ID</TableHeading>
                      <TableHeading>Name</TableHeading>
                      <TableHeading>Category</TableHeading>
                      {auth.user.hasRole && auth.user.hasRole("Admin") && (
                        <TableHeading>Assigned By</TableHeading>
                      )}
                      <TableHeading>Assigned To</TableHeading>
                      <TableHeading>Status</TableHeading>
                      <TableHeading>Completed</TableHeading>
                      <TableHeading>Priority</TableHeading>
                      <TableHeading>Due Date</TableHeading>
                      <TableHeading>Action</TableHeading>
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
                        {auth.user.hasRole && auth.user.hasRole("Admin") && (
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
                          {/* <Link
                            href={route("tasks.show", task.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            View
                          </Link> */}
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
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
