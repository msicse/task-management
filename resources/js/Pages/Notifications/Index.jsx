import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import {
  FaTasks,
  FaSyncAlt,
  FaCheckCircle,
  FaThumbsUp,
  FaBell,
  FaTrash,
  FaSpinner
} from "react-icons/fa";

export default function Index({ auth }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications/all?page=${page}&per_page=${perPage}`);
      setNotifications(response.data.notifications);
      setCurrentPage(response.data.meta.current_page);
      setTotalPages(response.data.meta.last_page);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.post(route("notifications.mark-as-read", id));
      // Update the notification in the list as read
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await axios.delete(route("notifications.destroy", id));
      // Remove the notification from the list
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(route("notifications.mark-all-read"));
      // Mark all notifications as read
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchNotifications(page);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <FaTasks className="text-blue-500 text-lg" />;
      case "task_status_updated":
        return <FaSyncAlt className="text-yellow-500 text-lg" />;
      case "task_completed":
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case "task_approved":
        return <FaThumbsUp className="text-purple-500 text-lg" />;
      default:
        return <FaBell className="text-gray-500 text-lg" />;
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Notifications
          </h2>
          {notifications.some(notification => !notification.read_at) && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>
      }
    >
      <Head title="Notifications" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10">
                  <FaBell className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500">You have no notifications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg flex items-start gap-4 ${
                        notification.read_at
                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <Link
                          href={
                            notification.task_id
                              ? route("tasks.show", notification.task_id)
                              : "#"
                          }
                          className={`block ${
                            !notification.read_at
                              ? "font-medium"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => !notification.read_at && markAsRead(notification.id)}
                        >
                          {notification.message}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>
                            {notification.created_at}
                            {notification.read_at &&
                              ` • Read ${notification.read_at}`}
                          </span>
                          {notification.task_name && (
                            <>
                              <span>•</span>
                              <span className="text-blue-500 dark:text-blue-400">
                                {notification.task_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {!notification.read_at && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                            title="Mark as read"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => changePage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "bg-white hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
