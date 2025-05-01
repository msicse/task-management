import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
} from "@/constants.jsx";
import CommentForm from "@/Components/CommentForm";
import FileUpload from "@/Components/FileUpload";
import TaskFiles from "@/Components/TaskFiles";
import { useState } from "react";

export default function Show({ auth, task, comments, files }) {
  const [replyingTo, setReplyingTo] = useState(null);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Task Details
          </h2>
          <div className="flex space-x-3">
            <Link
              href={route("tasks.edit", task.id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Task
            </Link>
            <Link
              href={route("tasks.index")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Back to Tasks
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Task Details" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Task Header Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {task.name}
                  </h1>
                  <div className="ml-4 flex space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        TASK_STATUS_CLASS_MAP[task.status]
                      }`}
                    >
                      {TASK_STATUS_TEXT_MAP[task.status]}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        TASK_PRIORITY_CLASS_MAP[task.priority]
                      }`}
                    >
                      {TASK_PRIORITY_TEXT_MAP[task.priority]}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
                  Created by {task.createdBy.name} on {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Description */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Task Details */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.due_date || "No due date set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.assignedUser.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated By</p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.updatedBy.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Files */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Files
                  </h3>
                  <FileUpload taskId={task.id} />
                  <div className="mt-6">
                    <TaskFiles files={files} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Comments
                  </h3>
                  <CommentForm taskId={task.id} />
                </div>

                <div className="space-y-6">
                  {comments?.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.name}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {comment.user.name}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>

                            {/* Sub-comments */}
                            {comment.replies?.length > 0 && (
                              <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="mt-3 first:mt-0">
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0">
                                        <img
                                          className="h-8 w-8 rounded-full"
                                          src={reply.user.avatar || `https://ui-avatars.com/api/?name=${reply.user.name}`}
                                          alt=""
                                        />
                                      </div>
                                      <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {reply.user.name}
                                          </h4>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                          {reply.content}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-2">
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                {replyingTo === comment.id ? "Cancel Reply" : "Reply"}
                              </button>
                            </div>

                            {replyingTo === comment.id && (
                              <div className="mt-4">
                                <CommentForm taskId={task.id} parentId={comment.id} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
