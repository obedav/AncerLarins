<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\PushToken;
use App\Models\User;

class NotificationService
{
    public function __construct(
        protected FCMService $fcmService,
    ) {}

    public function send(User $user, string $title, string $body, string $type = 'general', array $data = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'title'   => $title,
            'body'    => $body,
            'type'    => $type,
            'data'    => $data ?: null,
        ]);

        $this->sendPush($user, $title, $body, $data);

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

    protected function sendPush(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = PushToken::where('user_id', $user->id)
            ->active()
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return;
        }

        $this->fcmService->sendToMultiple($tokens, $title, $body, $data);
    }
}
