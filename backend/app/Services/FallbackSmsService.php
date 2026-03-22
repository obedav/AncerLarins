<?php

namespace App\Services;

use App\Contracts\SmsService;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

class FallbackSmsService implements SmsService
{
    protected LoggerInterface $logger;

    public function __construct(
        protected SmsService $primary,
        protected SmsService $fallback,
        ?LoggerInterface $logger = null,
    ) {
        $this->logger = $logger ?? new NullLogger;
    }

    public function sendSms(string $phone, string $message): array
    {
        try {
            $result = $this->primary->sendSms($phone, $message);

            if (isset($result['code']) && $result['code'] === 'ok') {
                return $result;
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Primary SMS provider failed, trying fallback', [
                'error' => $e->getMessage(),
            ]);
        }

        $this->logger->info('Falling back to secondary SMS provider');

        return $this->fallback->sendSms($phone, $message);
    }
}
