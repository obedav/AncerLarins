<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\PushToken;
use App\Models\User;
use App\Services\FCMService;
use App\Services\TermiiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct(
        protected string $notificationId,
        protected string $userId,
        protected string $title,
        protected string $body,
        protected array $channels,
        protected array $data = [],
    ) {}

    public function handle(FCMService $fcmService, TermiiService $termiiService): void
    {
        $notification = Notification::find($this->notificationId);
        $user = User::find($this->userId);

        if (! $notification || ! $user) {
            return;
        }

        if (in_array('push', $this->channels)) {
            $this->sendPush($user, $fcmService);
            $notification->update(['sent_push' => true]);
        }

        if (in_array('email', $this->channels)) {
            $this->sendEmail($user);
            $notification->update(['sent_email' => true]);
        }

        if (in_array('whatsapp', $this->channels)) {
            $this->sendWhatsApp($user, $termiiService);
            $notification->update(['sent_whatsapp' => true]);
        }
    }

    protected function sendPush(User $user, FCMService $fcmService): void
    {
        $tokens = PushToken::where('user_id', $user->id)
            ->active()
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return;
        }

        $fcmService->sendToMultiple($tokens, $this->title, $this->body, $this->data);
    }

    protected function sendEmail(User $user): void
    {
        if (! $user->email) {
            return;
        }

        Mail::raw($this->body, function ($message) use ($user) {
            $message->to($user->email)
                ->subject($this->title);
        });
    }

    protected function sendWhatsApp(User $user, TermiiService $termiiService): void
    {
        if (! $user->phone) {
            return;
        }

        $message = "{$this->title}\n\n{$this->body}";
        $termiiService->sendSms($user->phone, $message);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendNotificationJob failed', [
            'notification_id' => $this->notificationId,
            'user_id' => $this->userId,
            'channels' => $this->channels,
            'error' => $exception->getMessage(),
        ]);
    }
}
