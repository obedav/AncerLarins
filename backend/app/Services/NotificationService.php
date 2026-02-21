<?php

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function send(User $user, string $title, string $body, string $type = 'general', array $data = []): Notification
    {
        $channels = $this->resolveChannels($user);

        $notification = Notification::create([
            'user_id'     => $user->id,
            'title'       => $title,
            'body'        => $body,
            'type'        => $type,
            'action_type' => $data['action_type'] ?? null,
            'action_id'   => $data['action_id'] ?? null,
            'action_url'  => $data['action_url'] ?? null,
            'channels'    => $channels,
        ]);

        SendNotificationJob::dispatch(
            $notification->id,
            $user->id,
            $title,
            $body,
            $channels,
            $data,
        )->onQueue('notifications');

        return $notification;
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->markRead();
    }

    public function markAllAsRead(string $userId): void
    {
        Notification::where('user_id', $userId)
            ->unread()
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(string $userId): int
    {
        return Notification::where('user_id', $userId)->unread()->count();
    }

    protected function resolveChannels(User $user): array
    {
        $channels = [];

        if ($user->notify_push ?? true) {
            $channels[] = 'push';
        }

        if ($user->notify_email ?? false) {
            $channels[] = 'email';
        }

        if ($user->notify_whatsapp ?? false) {
            $channels[] = 'whatsapp';
        }

        if (empty($channels)) {
            $channels[] = 'push';
        }

        return $channels;
    }
}
