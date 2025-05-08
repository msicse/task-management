import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
    FaBell,
    FaTasks,
    FaSyncAlt,
    FaCheckCircle,
    FaThumbsUp,
    FaSpinner
} from 'react-icons/fa';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState({ unread: [], read: [], unread_count: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching notifications...');
            const response = await axios.get(route('notifications.index'));
            console.log('Notifications response:', response.data);

            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            console.log('Marking notification as read:', id);
            await axios.post(route('notifications.mark-as-read', id));
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            console.log('Marking all notifications as read');
            await axios.post(route('notifications.mark-all-read'));
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        setIsOpen(false);
    };

    // Initialize data
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'task_assigned':
                return <FaTasks />;
            case 'task_status_updated':
                return <FaSyncAlt />;
            case 'task_completed':
                return <FaCheckCircle />;
            case 'task_approved':
                return <FaThumbsUp />;
            default:
                return <FaBell />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out"
            >
                <div className="relative">
                    <FaBell className="text-gray-400 text-lg" />
                    {notifications.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            {notifications.unread_count}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {notifications.unread_count > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading && (
                            <div className="p-4 text-center">
                                <FaSpinner className="animate-spin inline mr-2" /> Loading...
                            </div>
                        )}

                        {error && (
                            <div className="p-4 text-center text-red-500">
                                {error}
                            </div>
                        )}

                        {!loading && !error && notifications.unread && notifications.unread.length === 0 &&
                         notifications.read && notifications.read.length === 0 && (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        )}

                        {/* Unread notifications */}
                        {notifications.unread && notifications.unread.map((notification) => (
                            <div
                                key={notification.id}
                                className="px-4 py-3 border-b border-gray-100 bg-blue-50 hover:bg-blue-100"
                            >
                                <Link
                                    href={notification.task_id ? route('tasks.show', notification.task_id) : '#'}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="block"
                                >
                                    <div className="flex items-start">
                                        <div className="mr-3 text-blue-500 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {notification.message}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {notification.created_at}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {/* Read notifications */}
                        {notifications.read && notifications.read.map((notification) => (
                            <div
                                key={notification.id}
                                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                            >
                                <Link
                                    href={notification.task_id ? route('tasks.show', notification.task_id) : '#'}
                                    className="block"
                                >
                                    <div className="flex items-start">
                                        <div className="mr-3 text-gray-400 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                {notification.message}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {notification.created_at}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-200">
                        <Link
                            href={route('notifications.show-all')}
                            className="block text-center text-sm text-blue-600 hover:text-blue-800"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
