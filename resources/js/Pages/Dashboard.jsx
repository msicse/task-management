import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
} from "@/constants";

export default function Dashboard({
  auth,
  totalPendingTasks,
  myPendingTasks,
  totalProgressTasks,
  myProgressTasks,
  totalCompletedTasks,
  myCompletedTasks,
  activeTasks,
  createdPendingTasks,
  createdProgressTasks,
  createdCompletedTasks,
  myCreatedTasks,
}) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Task Summary
            </h2>

            {/* Task Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Tasks Assigned To Me */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Tasks Assigned To Me
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pending Tasks */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {myPendingTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <span className="text-amber-500 dark:text-amber-300 text-xl">
                            ⏱️
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((myPendingTasks / (totalPendingTasks || 1)) * 100).toFixed(0)}% of all pending tasks
                        </p>
                      </div>
                    </div>

                    {/* In Progress Tasks */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            In Progress
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {myProgressTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 dark:text-blue-300 text-xl">
                            🔄
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((myProgressTasks / (totalProgressTasks || 1)) * 100).toFixed(0)}% of all in-progress tasks
                        </p>
                      </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {myCompletedTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-500 dark:text-green-300 text-xl">
                            ✅
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((myCompletedTasks / (totalCompletedTasks || 1)) * 100).toFixed(0)}% of all completed tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Created By Me */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Tasks Created By Me
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pending Tasks Created */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {createdPendingTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <span className="text-amber-500 dark:text-amber-300 text-xl">
                            📝
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((createdPendingTasks / (totalPendingTasks || 1)) * 100).toFixed(0)}% of all pending tasks
                        </p>
                      </div>
                    </div>

                    {/* In Progress Tasks Created */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            In Progress
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {createdProgressTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 dark:text-blue-300 text-xl">
                            👨‍💻
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((createdProgressTasks / (totalProgressTasks || 1)) * 100).toFixed(0)}% of all in-progress tasks
                        </p>
                      </div>
                    </div>

                    {/* Completed Tasks Created */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {createdCompletedTasks}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-500 dark:text-green-300 text-xl">
                            🎉
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((createdCompletedTasks / (totalCompletedTasks || 1)) * 100).toFixed(0)}% of all completed tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Tasks and Created Tasks Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Assigned Tasks Table */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Tasks Assigned To Me
                    </h3>
                    <Link
                      href={route("task.mytasks")}
                      className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Task
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Priority
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {activeTasks.length ? (
                          activeTasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {task.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {task.category?.name || 'No Category'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_STATUS_CLASS_MAP[task.status]
                                  }
                                >
                                  {TASK_STATUS_TEXT_MAP[task.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_PRIORITY_CLASS_MAP[task.priority]
                                  }
                                >
                                  {TASK_PRIORITY_TEXT_MAP[task.priority]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Link
                                  href={route("tasks.show", task.id)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No active tasks assigned to you
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* My Created Tasks Table */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Tasks Created By Me
                    </h3>
                    <Link
                      href={route("tasks.index")}
                      className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Task
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Assignee
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {myCreatedTasks.length ? (
                          myCreatedTasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {task.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {task.category?.name || 'No Category'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  {task.assignedUser?.name || 'Unassigned'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={
                                    "px-2 py-1 text-xs rounded text-white " +
                                    TASK_STATUS_CLASS_MAP[task.status]
                                  }
                                >
                                  {TASK_STATUS_TEXT_MAP[task.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Link
                                  href={route("tasks.show", task.id)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              You haven't created any active tasks
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
