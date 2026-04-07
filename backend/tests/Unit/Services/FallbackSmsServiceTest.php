<?php

namespace Tests\Unit\Services;

use App\Contracts\SmsService;
use App\Services\FallbackSmsService;
use PHPUnit\Framework\TestCase;

class FallbackSmsServiceTest extends TestCase
{
    public function test_returns_primary_result_on_success(): void
    {
        $primary = $this->createMock(SmsService::class);
        $fallback = $this->createMock(SmsService::class);

        $primary->method('sendSms')->willReturn(['code' => 'ok', 'message_id' => '123']);
        $fallback->expects($this->never())->method('sendSms');

        $service = new FallbackSmsService($primary, $fallback);
        $result = $service->sendSms('+2348012345678', 'Test message');

        $this->assertEquals('ok', $result['code']);
    }

    public function test_falls_back_when_primary_throws(): void
    {
        $primary = $this->createMock(SmsService::class);
        $fallback = $this->createMock(SmsService::class);

        $primary->method('sendSms')->willThrowException(new \RuntimeException('Connection timeout'));
        $fallback->method('sendSms')->willReturn(['code' => 'ok', 'message_id' => '456']);

        $service = new FallbackSmsService($primary, $fallback);
        $result = $service->sendSms('+2348012345678', 'Test message');

        $this->assertEquals('ok', $result['code']);
    }

    public function test_falls_back_when_primary_returns_failure(): void
    {
        $primary = $this->createMock(SmsService::class);
        $fallback = $this->createMock(SmsService::class);

        $primary->method('sendSms')->willReturn(['status' => false, 'error' => 'Invalid API key']);
        $fallback->method('sendSms')->willReturn(['code' => 'ok', 'message_id' => '789']);

        $service = new FallbackSmsService($primary, $fallback);
        $result = $service->sendSms('+2348012345678', 'Test message');

        $this->assertEquals('ok', $result['code']);
    }

    public function test_returns_fallback_failure_when_both_fail(): void
    {
        $primary = $this->createMock(SmsService::class);
        $fallback = $this->createMock(SmsService::class);

        $primary->method('sendSms')->willReturn(['status' => false, 'error' => 'Primary down']);
        $fallback->method('sendSms')->willReturn(['status' => false, 'error' => 'Fallback down']);

        $service = new FallbackSmsService($primary, $fallback);
        $result = $service->sendSms('+2348012345678', 'Test message');

        $this->assertFalse($result['status']);
        $this->assertEquals('Fallback down', $result['error']);
    }

    public function test_passes_phone_and_message_to_both_providers(): void
    {
        $primary = $this->createMock(SmsService::class);
        $fallback = $this->createMock(SmsService::class);

        $phone = '+2348012345678';
        $message = 'Your code is 123456';

        $primary->expects($this->once())
            ->method('sendSms')
            ->with($phone, $message)
            ->willReturn(['status' => false]);

        $fallback->expects($this->once())
            ->method('sendSms')
            ->with($phone, $message)
            ->willReturn(['code' => 'ok']);

        $service = new FallbackSmsService($primary, $fallback);
        $service->sendSms($phone, $message);
    }
}
