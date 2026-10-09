<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CriticRegisteredNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly User $critic)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'critic_registered',
            'critic_id' => $this->critic->id,
            'name' => $this->critic->name,
            'email' => $this->critic->email,
            'college' => $this->critic->college,
            'message' => "{$this->critic->name} registered as an English Critic and is awaiting review.",
        ];
    }
}
