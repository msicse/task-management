<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;
    protected $completedBy;
    protected $timeSpent;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $completedBy, $timeSpent = null)
    {
        $this->task = $task;
        $this->completedBy = $completedBy;
        $this->timeSpent = $timeSpent ?? $task->time_log;
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

        $message = (new MailMessage)
            ->subject('Task Completed: ' . $this->task->name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A task has been marked as completed by ' . $this->completedBy->name . '.')
            ->line('Task: ' . $this->task->name);

        if ($this->timeSpent) {
            $message->line('Time Spent: ' . $this->timeSpent . ' hours');
        }

        return $message->line('Completed At: ' . $this->task->completed_at->format('Y-m-d H:i'))
            ->action('View Task', $url)
            ->line('Please review the completed task and approve if appropriate.');
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
            'completed_by' => $this->completedBy->name,
            'completed_at' => $this->task->completed_at->format('Y-m-d H:i'),
            'time_spent' => $this->timeSpent,
            'message' => 'Task "' . $this->task->name . '" has been marked as completed by ' . $this->completedBy->name,
            'type' => 'task_completed',
        ];
    }
}
