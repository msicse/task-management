<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasks Report</title>
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
            text-align: center;
        }
        .filter-summary {
            background-color: #f3f4f6;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .report-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 14px;
            color: #6b7280;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
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
            font-weight: bold;
        }
        .priority-medium {
            color: #f59e0b;
        }
        .priority-low {
            color: #10b981;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        .page-break {
            page-break-after: always;
        }
        .summary-box {
            border: 1px solid #d1d5db;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9fafb;
        }
        .summary-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #4b5563;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        .summary-item {
            padding: 5px;
        }
        .truncate {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    </style>
</head>
<body>
    <h1>Tasks Report</h1>

    <div class="report-meta">
        <div>Generated: {{ now()->format('Y-m-d H:i:s') }}</div>
        <div>Total Tasks: {{ count($tasks) }}</div>
    </div>

    @if(!empty($filters))
    <div class="filter-summary">
        <strong>Filters applied:</strong>
        @foreach($filters as $key => $value)
            @if($value)
                <span>{{ ucfirst(str_replace('_', ' ', $key)) }}: {{ is_array($value) ? implode(', ', $value) : $value }}; </span>
            @endif
        @endforeach
    </div>
    @endif

    <!-- Summary Section -->
    <div class="summary-box">
        <div class="summary-title">Report Summary</div>
        <div class="summary-grid">
            <div class="summary-item">
                <strong>By Status:</strong>
                <ul>
                    @php
                        $statusCounts = $tasks->groupBy('status')->map->count();
                    @endphp
                    @foreach($statusCounts as $status => $count)
                        <li>{{ ucfirst($status) }}: {{ $count }}</li>
                    @endforeach
                </ul>
            </div>
            <div class="summary-item">
                <strong>By Priority:</strong>
                <ul>
                    @php
                        $priorityCounts = $tasks->groupBy('priority')->map->count();
                    @endphp
                    @foreach($priorityCounts as $priority => $count)
                        <li>{{ ucfirst($priority) }}: {{ $count }}</li>
                    @endforeach
                </ul>
            </div>
            <div class="summary-item">
                <strong>Completion Rate:</strong>
                @php
                    $completedCount = $tasks->where('status', 'completed')->count();
                    $totalCount = count($tasks);
                    $completionRate = $totalCount > 0 ? round(($completedCount / $totalCount) * 100, 1) : 0;
                @endphp
                <p>{{ $completionRate }}% ({{ $completedCount }} of {{ $totalCount }})</p>
            </div>
        </div>
    </div>

    <!-- Tasks Table -->
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Created By</th>
                <th>Due Date</th>
                <th>Time Spent</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tasks as $task)
            <tr>
                <td>#{{ $task->id }}</td>
                <td class="truncate"><a href="{{ route('tasks.show', $task->id) }}">{!! $task->name !!}</a></td>
                <td class="status-{{ $task->status }}">{{ ucfirst($task->status) }}</td>
                <td class="priority-{{ $task->priority }}">{{ ucfirst($task->priority) }}</td>
                <td>{{ $task->category ? $task->category->name : 'None' }}</td>
                <td>{{ $task->assignedUser ? $task->assignedUser->name : 'Unassigned' }}</td>
                <td>{{ $task->createdBy ? $task->createdBy->name : 'Unknown' }}</td>
                <td>{{ $task->due_date ? $task->due_date->format('Y-m-d') : '-' }}</td>
                <td>{{ $task->time_log ? $task->time_log . ' mins' : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ config('app.name') }} - Tasks Report
    </div>
</body>
</html>
