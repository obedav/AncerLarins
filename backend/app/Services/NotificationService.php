<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\PushToken;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function __construct(
        protected FCMService $fcmService,
        protected TermiiService $termiiService,
    ) {}

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

        if (in_array('push', $channels)) {
            $this->sendPush($user, $title, $body, $data);
            $notification->update(['sent_push' => true]);
        }

        if (in_array('email', $channels)) {
            $this->sendEmail($user, $title, $body, $data);
            $notification->update(['sent_email' => true]);
        }

        if (in_array('whatsapp', $channels)) {
            $this->sendWhatsApp($user, $title, $body);
            $notification->update(['sent_whatsapp' => true]);
        }

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

        // Ensure at least push is always sent as fallback
        if (empty($channels)) {
            $channels[] = 'push';
        }

        return $channels;
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

        try {
            $this->fcmService->sendToMultiple($tokens, $title, $body, $data);
        } catch (\Exception $e) {
            Log::error('Push notification failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }

    protected function sendEmail(User $user, string $title, string $body, array $data = []): void
    {
        if (! $user->email) {
            return;
        }

        try {
            Mail::raw($body, function ($message) use ($user, $title) {
                $message->to($user->email)
                    ->subject($title);
            });
        } catch (\Exception $e) {
            Log::error('Email notification failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }

    protected function sendWhatsApp(User $user, string $title, string $body): void
    {
        if (! $user->phone) {
            return;
        }

        try {
            $message = "{$title}\n\n{$body}";
            $this->termiiService->sendSms($user->phone, $message);
        } catch (\Exception $e) {
            Log::error('WhatsApp notification failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }
}
