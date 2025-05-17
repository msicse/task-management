import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
} from "@/constants.jsx";
import CommentForm from "@/Components/CommentForm";
import FileUpload from "@/Components/FileUpload";
import TaskFiles from "@/Components/TaskFiles";
import { useState, useEffect } from "react";
import Alert from "@/Components/Alert";
import { hasPermission, hasRole, canPerformTaskAction, isCreator, isAssigned } from "@/utils/permissions";
import { formatDateTime } from "@/utils/dateFormat";

export default function Show({ auth, task, comments, files, success }) {

  const [replyingTo, setReplyingTo] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [timeSpent, setTimeSpent] = useState("");
  const [taskRating, setTaskRating] = useState(5); // Default 5 stars
  const [showTimeSpentInput, setShowTimeSpentInput] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false); // New state for approval popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if current user is the creator of this task
  const userIsCreator = isCreator(auth.user, task);
  // Check if current user is the assignee of this task
  const userIsAssigned = isAssigned(auth.user, task);
  // Check if task is completed but not yet approved - works with both "completed" and "waiting_for_approval" statuses
  const isCompletedNotApproved = (task.status === "completed" || task.status === "waiting_for_approval") && !task.approved_at;

  // Permission checks for various task actions
  const canEdit = canPerformTaskAction(auth.user, task, 'edit');
  const canDelete = canPerformTaskAction(auth.user, task, 'delete');
  const canApprove = canPerformTaskAction(auth.user, task, 'approve');
  const canComplete = canPerformTaskAction(auth.user, task, 'complete');


  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    // Check if user has permission to change status
    if (!canEdit && !canComplete) {
      setErrorMessage("You do not have permission to change the task status.");
      setShowError(true);
      return;
    }

    // Prevent changing status if task is completed, unless the user can approve tasks
    if (task.status === "completed" && !canApprove) {
      setErrorMessage("You cannot change the status of a completed task.");
      setShowError(true);
      return;
    }

    setUpdating(true);

    try {
      // If changing to completed, verify permission and show time spent input
      if (newStatus === "completed" && task.status !== "completed") {
        if (!canComplete) {
          setErrorMessage("You do not have permission to mark this task as completed.");
          setShowError(true);
          setUpdating(false);
          return;
        }
        setShowTimeSpentInput(true);
        return;
      }

      router.visit(route("tasks.update-details", task.id), {
        method: "put",
        data: { status: newStatus },
        preserveScroll: true,
        onSuccess: (page) => {
          setSuccessMessage(page.props.success);
          setShowSuccess(true);
          setShowError(false);
          setUpdating(false);
        },
        onError: (errors) => {
          // Handle both standard Inertia errors and plain JSON responses
          let errorMsg = "Failed to update task status. Please try again.";

          if (errors.message) {
            errorMsg = errors.message;
          } else if (errors.response && errors.response.data) {
            // Handle plain JSON error responses
            const responseData = errors.response.data;
            errorMsg = responseData.error || responseData.message || errorMsg;
          }

          setErrorMessage(errorMsg);
          setShowError(true);
          setShowSuccess(false);
          setUpdating(false);
        },
      });
    } catch (error) {

      setErrorMessage("An unexpected error occurred while updating task status.");
      setShowError(true);
      setShowSuccess(false);
      setUpdating(false);
    }
  };

  const handleTimeSpentSubmit = async () => {
    // Verify permission to complete task
    if (!canComplete) {
      setErrorMessage("You do not have permission to complete this task.");
      setShowError(true);
      return;
    }

    setUpdating(true);
    try {
      // Determine the scoreType based on who is completing the task
      // Creator will give rating to the assignee - assignee_rating
      // Assignee will give rating to the creator - creator_rating

      // If user is the assignee, they rate the creator's task (creator_rating)
      // If user is the creator, they rate the assignee's work (assignee_rating)
      const scoreType = userIsAssigned ? 'creator_rating' : 'assignee_rating';

      router.visit(route("tasks.update-details", task.id), {
        method: "put",
        data: {
          status: "completed",
          time_spent: parseFloat(timeSpent),
          scoreType: scoreType,
          score: taskRating
        },
        preserveScroll: true,
        onSuccess: (page) => {
          setSuccessMessage(page.props.success);
          setShowSuccess(true);
          setShowError(false);
          setShowTimeSpentInput(false);
          setTimeSpent("");
          setTaskRating(5);
          setUpdating(false);
        },
        onError: (errors) => {
          // Handle both standard Inertia errors and plain JSON responses
          let errorMsg = "Failed to complete task. Please try again.";

          if (errors.message) {
            errorMsg = errors.message;
          } else if (errors.response && errors.response.data) {
            // Handle plain JSON error responses
            const responseData = errors.response.data;
            errorMsg = responseData.error || responseData.message || errorMsg;
          }

          setErrorMessage(errorMsg);
          setShowError(true);
          setShowSuccess(false);
          setUpdating(false);
        },
      });
    } catch (error) {

      setErrorMessage("An unexpected error occurred while completing the task.");
      setShowError(true);
      setShowSuccess(false);
      setUpdating(false);
    }
  };

  // New function to handle task approval
  const handleApproval = async () => {
    setUpdating(true);
    try {
      router.visit(route("tasks.update-details", task.id), {
        method: "put",
        data: {
          approved_at: new Date().toISOString(),
          scoreType: 'assignee_rating',
          score: taskRating
        },
        preserveScroll: true,
        onSuccess: (page) => {
          setSuccessMessage(page.props.success || "Task approved successfully");
          setShowSuccess(true);
          setShowError(false);
          setShowApprovalPopup(false);
          setTaskRating(5);
          setUpdating(false);
        },
        onError: (errors) => {
          // Handle both standard Inertia errors and plain JSON responses
          let errorMsg = "Failed to approve task. Please try again.";

          if (errors.message) {
            errorMsg = errors.message;
          } else if (errors.response && errors.response.data) {
            // Handle plain JSON error responses
            const responseData = errors.response.data;
            errorMsg = responseData.error || responseData.message || errorMsg;
          }

          setErrorMessage(errorMsg);
          setShowError(true);
          setShowSuccess(false);
          setUpdating(false);
        },
      });
    } catch (error) {
      console.error("Failed to approve task:", error);

      // Handle non-Inertia JSON error responses that might be caught here
      let errorMsg = "An unexpected error occurred while approving the task.";
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        errorMsg = responseData.error || responseData.message || errorMsg;
      }

      setErrorMessage(errorMsg);
      setShowError(true);
      setShowSuccess(false);
      setUpdating(false);
    }
  };

  // Set initial success message from props if it exists
  useEffect(() => {
    if (success) {
      setSuccessMessage(success);
      setShowSuccess(true);
    }
  }, [success]);

  // Generate stars for the ratings dropdown
  const renderRatingOptions = () => {
    const options = [];
    for (let i = 1; i <= 5; i++) {
      options.push(
        <option key={i} value={i}>
          {i} {i === 1 ? 'Star' : 'Stars'}
        </option>
      );
    }
    return options;
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Task Details
          </h2>
          <div className="flex space-x-3">
            {canEdit && (
              <Link
                href={route("tasks.edit", task.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit Task
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  if(confirm('Are you sure you want to delete this task?')) {
                    router.delete(route("tasks.destroy", task.id), {
                      onSuccess: () => {
                        // No need to set success message here as the user will be redirected
                      },
                      onError: (errors) => {
                        // Handle both standard Inertia errors and plain JSON responses
                        let errorMsg = "Failed to delete task. Please try again.";

                        if (errors.message) {
                          errorMsg = errors.message;
                        } else if (errors.response && errors.response.data) {
                          // Handle plain JSON error responses
                          const responseData = errors.response.data;
                          errorMsg = responseData.error || responseData.message || errorMsg;
                        }

                        setErrorMessage(errorMsg);
                        setShowError(true);
                        setShowSuccess(false);
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Task
              </button>
            )}
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
          {showError && (
            <Alert
              message={errorMessage}
              type="error"
              onClose={() => setShowError(false)}
            />
          )}
          {showSuccess && (
            <Alert
              message={successMessage}
              type="success"
              onClose={() => setShowSuccess(false)}
            />
          )}

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {task.name}
                  </h1>
                  <select
                    value={task.status === "waiting_for_approval" ? "completed" : task.status}
                    onChange={handleStatusChange}
                    disabled={
                      updating ||
                      (!canEdit && !canComplete) ||
                      // Only allow status change if it's not completed or user can approve
                      (task.status === "completed" && !task.approved_at && !canApprove)
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* Add Approve button for creators when task is completed */}

                  {canApprove && isCompletedNotApproved ? (
                    userIsCreator || hasRole(auth.user, "admin") ? (
                    <button
                      onClick={() => setShowApprovalPopup(true)}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    ): ""
                  ) : (
                    canEdit && (
                      <span className="text-xs text-gray-500 italic">
                        {task.status !== "completed" && task.status !== "waiting_for_approval"
                          ? "(Task must be completed to approve)"
                          : task.approved_at
                            ? "(Already approved)"
                            : "(Approval button not showing)"}
                      </span>
                    )
                  )}

                  {/* Time spent popup */}
                  {showTimeSpentInput && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                          Complete Task
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Time Spent (minutes)
                            </label>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={timeSpent}
                              onChange={(e) => setTimeSpent(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Minutes spent on task"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Rate This Task
                            </label>
                            <select
                              value={taskRating}
                              onChange={(e) => setTaskRating(parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              {renderRatingOptions()}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              Your rating helps improve task quality
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => {
                              setShowTimeSpentInput(false);
                              setTimeSpent("");
                              setTaskRating(5);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleTimeSpentSubmit}
                            disabled={!timeSpent}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Complete Task
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approval popup */}
                  {showApprovalPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                          Approve Task
                        </h3>
                        <div className="space-y-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            You are approving the completed task. Please rate the assignee's work.
                          </p>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Rate Assignee's Work
                            </label>
                            <select
                              value={taskRating}
                              onChange={(e) => setTaskRating(parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              {renderRatingOptions()}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              Your rating helps recognize good work
                            </p>
                          </div>

                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={() => {
                                setShowApprovalPopup(false);
                                setTaskRating(5);
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleApproval}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Approve Task
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      TASK_PRIORITY_CLASS_MAP[task.priority]
                    }`}
                  >
                    {TASK_PRIORITY_TEXT_MAP[task.priority]}
                  </span>
                </div>
                <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
                  Created by {task.createdBy.name} on{" "}
                  {formatDateTime(task.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Due Date
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.due_date
                          ? formatDateTime(task.due_date)
                          : "No due date set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Completion Date
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.completed_at
                          ? formatDateTime(task.completed_at)
                          : "Not completed yet"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Creation Date
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.created_at
                          ? formatDateTime(task.created_at)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Time Log
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.time_log ? `${task.time_log} minutes` : "No time logged"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Assigned To
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.assignedUser.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.category ? task.category.name : "Uncategorized"}
                      </p>
                    </div>
                    {/* Approval Status */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Approval Status
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {task.approved_at
                          ? `Approved on ${formatDateTime(task.approved_at)}`
                          : task.status === "completed"
                            ? "Awaiting approval"
                            : "Not applicable"}
                      </p>
                    </div>
                    {/* Rating display based on user role */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {auth.user.id === task.assigned_user_id ? "Creator Rating" : "Assignee Rating"}
                      </p>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {auth.user.id === task.assigned_user_id
                          ? (task.assignee_rating
                              ? `${task.assignee_rating} Stars`
                              : "Not rated yet")
                          : (task.creator_rating
                              ? `${task.creator_rating} Stars`
                              : "Not rated yet")
                        }
                      </p>
                    </div>
                    {/* Visual star rating display */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rating
                      </p>
                      <div className="flex mt-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className={`w-5 h-5 ${
                              index < (auth.user.id === task.assigned_user_id ? task.assignee_rating || 0 : task.creator_rating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Description
                  </h3>
                  <div
                    className="text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: task.description || "No description provided.",
                    }}
                  />
                </div>
              </div>

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

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Comments
                  </h3>
                  <CommentForm taskId={task.id} />
                </div>

                <div className="space-y-6">
                  {comments?.data?.length > 0 ? (
                    comments.data.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                comment.user.avatar ||
                                `https://ui-avatars.com/api/?name=${comment.user.name}`
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {comment.user.name}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {comment.created_at} ({comment.created_at_human})
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>

                            {comment.replies?.length > 0 && (
                              <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                {comment.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="mt-3 first:mt-0"
                                  >
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0">
                                        <img
                                          className="h-8 w-8 rounded-full"
                                          src={
                                            reply.user.avatar ||
                                            `https://ui-avatars.com/api/?name=${reply.user.name}`
                                          }
                                          alt=""
                                        />
                                      </div>
                                      <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {reply.user.name}
                                          </h4>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {reply.created_at} ({reply.created_at_human})
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
                                onClick={() =>
                                  setReplyingTo(
                                    replyingTo === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                                className="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                {replyingTo === comment.id
                                  ? "Cancel Reply"
                                  : "Reply"}
                              </button>
                            </div>

                            {replyingTo === comment.id && (
                              <div className="mt-4">
                                <CommentForm
                                  taskId={task.id}
                                  parentId={comment.id}
                                  ButtonName="Reply"
                                />
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
