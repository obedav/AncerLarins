<?php

namespace App\Contracts;

interface SmsService
{
    /**
     * Send an SMS message.
     *
     * @return array{code?: string, status?: bool, error?: string}
     */
    public function sendSms(string $phone, string $message): array;
}
