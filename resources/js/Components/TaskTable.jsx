import React from "react";
import { Link } from "@inertiajs/react";
import TableHeading from "@/Components/TableHeading";

import {
    TASK_PRIORITY_CLASS_MAP,
    TASK_PRIORITY_TEXT_MAP,
    TASK_STATUS_CLASS_MAP,
    TASK_STATUS_TEXT_MAP,
  } from "@/constants";

export default function TaskTable({ tasks, deleteTask }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Completed Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.name}</td>
              <td>{task.assignedUser.name}</td>
              <td>
                <span className={"px-2 py-1 rounded text-white " + TASK_STATUS_CLASS_MAP[task.status]}>
                  {TASK_STATUS_TEXT_MAP[task.status]}
                </span>
              </td>
              <td>{task.completed_at ? task.completed_at : "Not completed yet"}</td>
              <td>
                <span className={"px-2 py-1 rounded text-white " + TASK_PRIORITY_CLASS_MAP[task.priority]}>
                  {TASK_PRIORITY_TEXT_MAP[task.priority]}
                </span>
              </td>
              <td>
                {new Date(task.due_date) < new Date() ? (
                  <span className="text-red-600">Due date passed</span>
                ) : (
                  task.due_date
                )}
              </td>
              <td>
                <Link href={route("tasks.show", task.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                  View
                </Link>
                <Link href={route("tasks.edit", task.id)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3">
                  Edit
                </Link>
                <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
