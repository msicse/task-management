<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;
    protected $assignedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $assignedBy)
    {
        $this->task = $task;
        $this->assignedBy = $assignedBy;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/tasks/' . $this->task->id);

        return (new MailMessage)
            ->subject('New Task Assigned: ' . $this->task->name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You have been assigned a new task by ' . $this->assignedBy->name . '.')
            ->line('Task: ' . $this->task->name)
            ->line('Priority: ' . ucfirst($this->task->priority))
            ->line('Due Date: ' . ($this->task->due_date ? $this->task->due_date->format('Y-m-d') : 'No due date'))
            ->action('View Task', $url)
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'task_name' => $this->task->name,
            'assigned_by' => $this->assignedBy->name,
            'message' => 'You have been assigned a new task: ' . $this->task->name,
            'type' => 'task_assigned',
            'priority' => $this->task->priority,
        ];
    }
}
