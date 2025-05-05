import React from "react";
import { Link } from "@inertiajs/react";

export default function TaskTable({ tasks, columns, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions && <th>Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <tr key={task.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(task) : task[column.key]}</td>
              ))}
              {actions && (
                <td>
                  {actions.map((action, index) => (
                    <React.Fragment key={index}>
                      {action.type === "link" && (
                        <Link
                          href={action.href(task)}
                          className={action.className}
                        >
                          {action.label}
                        </Link>
                      )}
                      {action.type === "button" && (
                        <button
                          onClick={() => action.onClick(task)}
                          className={action.className}
                        >
                          {action.label}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
