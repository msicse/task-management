<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display the user's notifications.
     */
    public function index()
    {
        $user = Auth::user();

        // Get unread notifications
        $unreadNotifications = $user->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'notification',
                    'message' => $notification->data['message'] ?? 'You have a new notification',
                    'task_id' => $notification->data['task_id'] ?? null,
                    'task_name' => $notification->data['task_name'] ?? null,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'read_at' => null,
                ];
            });

        // Get the 5 most recent read notifications
        $readNotifications = $user->readNotifications()
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'notification',
                    'message' => $notification->data['message'] ?? 'Notification',
                    'task_id' => $notification->data['task_id'] ?? null,
                    'task_name' => $notification->data['task_name'] ?? null,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'read_at' => $notification->read_at->diffForHumans(),
                ];
            });

        return response()->json([
            'unread' => $unreadNotifications,
            'read' => $readNotifications,
            'unread_count' => $unreadNotifications->count(),
        ]);
    }

    /**
     * Show all notifications page
     */
    public function showAll()
    {
        return Inertia::render('Notifications/Index');
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy($id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    /**
     * API endpoint to get all user notifications with pagination
     */
    public function getAllNotifications(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $user = Auth::user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? 'notification',
                'message' => $notification->data['message'] ?? 'You have a notification',
                'task_id' => $notification->data['task_id'] ?? null,
                'task_name' => $notification->data['task_name'] ?? null,
                'created_at' => $notification->created_at->diffForHumans(),
                'read_at' => $notification->read_at ? $notification->read_at->diffForHumans() : null,
            ];
        });

        return response()->json([
            'notifications' => $formattedNotifications,
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }
}
