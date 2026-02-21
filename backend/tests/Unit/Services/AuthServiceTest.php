<?php

namespace Tests\Unit\Services;

use App\Services\AuthService;
use App\Services\TermiiService;
use PHPUnit\Framework\TestCase;

class AuthServiceTest extends TestCase
{
    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();

        $termii = $this->createMock(TermiiService::class);
        $this->authService = new AuthService($termii);
    }

    public function test_normalize_adds_country_code(): void
    {
        $result = $this->authService->normalizePhone('08012345678');
        $this->assertEquals('+2348012345678', $result);
    }

    public function test_normalize_handles_234_prefix(): void
    {
        $result = $this->authService->normalizePhone('2348012345678');
        $this->assertEquals('+2348012345678', $result);
    }

    public function test_normalize_preserves_plus234(): void
    {
        $result = $this->authService->normalizePhone('+2348012345678');
        $this->assertEquals('+2348012345678', $result);
    }

    public function test_normalize_strips_formatting(): void
    {
        $result = $this->authService->normalizePhone('080-1234-5678');
        $this->assertEquals('+2348012345678', $result);
    }
}
