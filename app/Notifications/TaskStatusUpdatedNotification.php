<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;
    protected $updatedBy;
    protected $previousStatus;
    protected $newStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $updatedBy, string $previousStatus)
    {
        $this->task = $task;
        $this->updatedBy = $updatedBy;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $task->status;
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
        $statusMap = [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed'
        ];

        return (new MailMessage)
            ->subject('Task Status Updated: ' . $this->task->name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('The status of a task has been updated by ' . $this->updatedBy->name . '.')
            ->line('Task: ' . $this->task->name)
            ->line('Previous Status: ' . ($statusMap[$this->previousStatus] ?? ucfirst($this->previousStatus)))
            ->line('New Status: ' . ($statusMap[$this->newStatus] ?? ucfirst($this->newStatus)))
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
            'updated_by' => $this->updatedBy->name,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'message' => 'Task "' . $this->task->name . '" status changed from ' .
                        ucfirst($this->previousStatus) . ' to ' . ucfirst($this->newStatus),
            'type' => 'task_status_updated',
        ];
    }
}
