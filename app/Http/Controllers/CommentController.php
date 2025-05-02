<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use App\Http\Resources\CommentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'task_id' => 'required|exists:tasks,id',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'content' => $validated['content'],
            'task_id' => $validated['task_id'],
            'parent_id' => $validated['parent_id'],
            'user_id' => Auth::id(),
        ]);

        // Load the task with its comments and their relationships
        $task = Task::with(['comments' => function($query) {
            $query->whereNull('parent_id')
                  ->with(['user', 'replies.user'])
                  ->latest();
        }])->find($validated['task_id']);

        // Return to the previous page with the updated comments
        return back()->with([
            'success' => 'Comment added successfully',
            'comments' => CommentResource::collection($task->comments)
        ]);
    }
}
