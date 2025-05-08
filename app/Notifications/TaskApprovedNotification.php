<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;
    protected $approvedBy;
    protected $rating;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $approvedBy, $rating = null)
    {
        $this->task = $task;
        $this->approvedBy = $approvedBy;
        $this->rating = $rating;
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
            ->subject('Task Approved: ' . $this->task->name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A task has been approved by ' . $this->approvedBy->name . '.')
            ->line('Task: ' . $this->task->name);

        if ($this->rating) {
            $message->line('Rating: ' . $this->rating . '/5');
        }

        return $message->line('Approved At: ' . $this->task->approved_at->format('Y-m-d H:i'))
            ->action('View Task', $url)
            ->line('Thank you for completing this task!');
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
            'approved_by' => $this->approvedBy->name,
            'approved_at' => $this->task->approved_at->format('Y-m-d H:i'),
            'rating' => $this->rating,
            'message' => 'Task "' . $this->task->name . '" has been approved by ' . $this->approvedBy->name,
            'type' => 'task_approved',
        ];
    }
}
