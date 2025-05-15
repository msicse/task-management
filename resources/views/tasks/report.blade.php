<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .task-header {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .task-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .meta-item {
            margin-bottom: 8px;
        }
        .meta-label {
            font-weight: bold;
            color: #4b5563;
        }
        .description {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f3f4f6;
        }
        .status-pending {
            color: #f59e0b;
        }
        .status-in_progress {
            color: #3b82f6;
        }
        .status-completed {
            color: #10b981;
        }
        .priority-high {
            color: #ef4444;
        }
        .priority-medium {
            color: #f59e0b;
        }
        .priority-low {
            color: #10b981;
        }
        .section-header {
            font-size: 18px;
            color: #4b5563;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .comment {
            padding: 10px;
            border-left: 4px solid #d1d5db;
            background-color: #f9fafb;
            margin-bottom: 10px;
        }
        .comment-meta {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .file-item {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <h1>Task Report</h1>

    <div class="task-header">
        <h2>{{ $task->name }}</h2>
        <div>
            <span class="meta-label">Status:</span>
            <span class="status-{{ $task->status }}">{{ ucfirst($task->status) }}</span>
            |
            <span class="meta-label">Priority:</span>
            <span class="priority-{{ $task->priority }}">{{ ucfirst($task->priority) }}</span>
        </div>
    </div>

    <div class="task-meta">
        <div class="meta-item">
            <span class="meta-label">ID:</span> #{{ $task->id }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Category:</span> {{ $task->category ? $task->category->name : 'None' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Assigned To:</span> {{ $task->assignedUser ? $task->assignedUser->name : 'Unassigned' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Created By:</span> {{ $task->createdBy ? $task->createdBy->name : 'Unknown' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Due Date:</span> {{ $task->due_date ? $task->due_date->format('Y-m-d') : 'No due date' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Created At:</span> {{ $task->created_at->format('Y-m-d H:i') }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Updated At:</span> {{ $task->updated_at->format('Y-m-d H:i') }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Time Spent(mins):</span> {{ $task->time_log ? $task->time_log : '0' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Completed At:</span> {{ $task->completed_at ? $task->completed_at->format('Y-m-d H:i') : 'Not completed' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Approved At:</span> {{ $task->approved_at ? $task->approved_at->format('Y-m-d H:i') : 'Not approved' }}
        </div>
        @if ($task->status === 'completed')
        <div class="meta-item">
            <span class="meta-label">Creator Rating:</span> {{ $task->creator_rating ? $task->creator_rating . '/5' : 'Not rated' }}
        </div>
        <div class="meta-item">
            <span class="meta-label">Assignee Rating:</span> {{ $task->assignee_rating ? $task->assignee_rating . '/5' : 'Not rated' }}
        </div>
        @endif
    </div>

    <h3 class="section-header">Description</h3>
    <div class="description">
        {!! $task->description !!}
    </div>

    @if(count($task->comments) > 0)
    <h3 class="section-header">Comments</h3>
    @foreach($task->comments->where('parent_id', null) as $comment)
        <div class="comment">
            <div class="comment-meta">
                {{ $comment->user->name }} - {{ $comment->created_at->format('Y-m-d H:i') }}
            </div>
            <div>{{ $comment->content }}</div>

            @if(count($comment->replies) > 0)
                @foreach($comment->replies as $reply)
                    <div class="comment" style="margin-left: 25px; margin-top: 8px;">
                        <div class="comment-meta">
                            {{ $reply->user->name }} - {{ $reply->created_at->format('Y-m-d H:i') }}
                        </div>
                        <div>{{ $reply->content }}</div>
                    </div>
                @endforeach
            @endif
        </div>
    @endforeach
    @endif

    @if(count($task->files) > 0)
    <h3 class="section-header">Attachments</h3>
    @foreach($task->files as $file)
        <div class="file-item">
            <div>{{ $file->original_name }}</div>
            <small>Uploaded by {{ $file->user->name }} on {{ $file->created_at->format('Y-m-d') }} - {{ $file->getFileSizeForHumans() }}</small>
        </div>
    @endforeach
    @endif

    <div class="footer">
        Report generated on {{ now()->format('Y-m-d H:i:s') }}
    </div>
</body>
</html>
