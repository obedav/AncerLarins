<?php

namespace App\Services;

use App\Models\User;
use App\Models\WebauthnCredential;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;
use Webauthn\AttestationStatement\NoneAttestationStatementSupport;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\AuthenticatorAssertionResponseValidator;
use Webauthn\AuthenticatorAttestationResponse;
use Webauthn\AuthenticatorAttestationResponseValidator;
use Webauthn\CeremonyStep\CeremonyStepManagerFactory;
use Webauthn\Denormalizer\WebauthnSerializerFactory;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialDescriptor;
use Webauthn\PublicKeyCredentialParameters;
use Webauthn\PublicKeyCredentialRequestOptions;
use Webauthn\PublicKeyCredentialRpEntity;
use Webauthn\PublicKeyCredentialSource;
use Webauthn\PublicKeyCredentialUserEntity;

class WebauthnService
{
    private function rpEntity(): PublicKeyCredentialRpEntity
    {
        return PublicKeyCredentialRpEntity::create(
            name: config('webauthn.rp_name'),
            id: config('webauthn.rp_id'),
        );
    }

    private function userEntity(User $user): PublicKeyCredentialUserEntity
    {
        return PublicKeyCredentialUserEntity::create(
            name: $user->phone,
            id: $user->id,
            displayName: $user->full_name,
        );
    }

    private function serializer(): \Symfony\Component\Serializer\SerializerInterface
    {
        $attestationManager = AttestationStatementSupportManager::create();
        $attestationManager->add(NoneAttestationStatementSupport::create());

        return (new WebauthnSerializerFactory($attestationManager))->create();
    }

    private function challengeKey(string $challengeId): string
    {
        return "webauthn:challenge:{$challengeId}";
    }

    public function beginRegistration(User $user): array
    {
        $challengeId = Str::uuid()->toString();
        $challenge = random_bytes(32);

        $existingCredentials = $user->webauthnCredentials->map(function (WebauthnCredential $cred) {
            return PublicKeyCredentialDescriptor::create(
                type: PublicKeyCredentialDescriptor::CREDENTIAL_TYPE_PUBLIC_KEY,
                id: base64_decode(strtr($cred->credential_id, '-_', '+/')),
            );
        })->all();

        $options = PublicKeyCredentialCreationOptions::create(
            rp: $this->rpEntity(),
            user: $this->userEntity($user),
            challenge: $challenge,
            pubKeyCredParams: [
                PublicKeyCredentialParameters::create('public-key', -7),   // ES256
                PublicKeyCredentialParameters::create('public-key', -257), // RS256
            ],
            authenticatorSelection: \Webauthn\AuthenticatorSelectionCriteria::create(
                residentKey: \Webauthn\AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_PREFERRED,
                userVerification: \Webauthn\AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED,
            ),
            attestation: PublicKeyCredentialCreationOptions::ATTESTATION_CONVEYANCE_PREFERENCE_NONE,
            excludeCredentials: $existingCredentials,
            timeout: 300_000,
        );

        $serialized = $this->serializer()->serialize($options, 'json');

        Cache::put($this->challengeKey($challengeId), [
            'options' => $serialized,
            'user_id' => $user->id,
        ], now()->addMinutes(5));

        return [
            'challenge_id' => $challengeId,
            'options' => json_decode($serialized, true),
        ];
    }

    public function completeRegistration(User $user, string $challengeId, array $credential, ?string $deviceName = null): WebauthnCredential
    {
        $cached = Cache::pull($this->challengeKey($challengeId));

        if (! $cached || $cached['user_id'] !== $user->id) {
            throw new \RuntimeException('Invalid or expired challenge.');
        }

        $options = $this->serializer()->deserialize(
            $cached['options'],
            PublicKeyCredentialCreationOptions::class,
            'json'
        );

        $publicKeyCredential = $this->serializer()->deserialize(
            json_encode($credential),
            PublicKeyCredential::class,
            'json'
        );

        $response = $publicKeyCredential->response;
        if (! $response instanceof AuthenticatorAttestationResponse) {
            throw new \RuntimeException('Invalid attestation response.');
        }

        $ceremonyStepManagerFactory = new CeremonyStepManagerFactory;
        $ceremonyStepManager = $ceremonyStepManagerFactory->creationCeremony();

        $validator = AuthenticatorAttestationResponseValidator::create(
            ceremonyStepManager: $ceremonyStepManager,
        );

        $credentialSource = $validator->check(
            authenticatorAttestationResponse: $response,
            publicKeyCredentialCreationOptions: $options,
            host: config('webauthn.rp_id'),
        );

        $transports = method_exists($response, 'getTransports')
            ? implode(',', $response->getTransports())
            : null;

        return $user->webauthnCredentials()->create([
            'credential_id' => rtrim(strtr(base64_encode($credentialSource->publicKeyCredentialId), '+/', '-_'), '='),
            'public_key' => base64_encode($this->serializer()->serialize($credentialSource, 'json')),
            'aaguid' => $credentialSource->aaguid->toString(),
            'sign_count' => $credentialSource->counter,
            'device_name' => $deviceName ?? 'Passkey',
            'transports' => $transports,
        ]);
    }

    public function beginAuthentication(): array
    {
        $challengeId = Str::uuid()->toString();
        $challenge = random_bytes(32);

        $options = PublicKeyCredentialRequestOptions::create(
            challenge: $challenge,
            rpId: config('webauthn.rp_id'),
            userVerification: PublicKeyCredentialRequestOptions::USER_VERIFICATION_REQUIREMENT_PREFERRED,
            timeout: 300_000,
        );

        $serialized = $this->serializer()->serialize($options, 'json');

        Cache::put($this->challengeKey($challengeId), [
            'options' => $serialized,
        ], now()->addMinutes(5));

        return [
            'challenge_id' => $challengeId,
            'options' => json_decode($serialized, true),
        ];
    }

    public function completeAuthentication(string $challengeId, array $assertion): User
    {
        $cached = Cache::pull($this->challengeKey($challengeId));

        if (! $cached) {
            throw new \RuntimeException('Invalid or expired challenge.');
        }

        $options = $this->serializer()->deserialize(
            $cached['options'],
            PublicKeyCredentialRequestOptions::class,
            'json'
        );

        $publicKeyCredential = $this->serializer()->deserialize(
            json_encode($assertion),
            PublicKeyCredential::class,
            'json'
        );

        $response = $publicKeyCredential->response;
        if (! $response instanceof AuthenticatorAssertionResponse) {
            throw new \RuntimeException('Invalid assertion response.');
        }

        // Find the credential in our database
        $credentialIdBase64url = rtrim(strtr(base64_encode($publicKeyCredential->rawId), '+/', '-_'), '=');
        $storedCredential = WebauthnCredential::where('credential_id', $credentialIdBase64url)->first();

        if (! $storedCredential) {
            throw new \RuntimeException('Credential not found.');
        }

        // Deserialize the stored public key credential source
        $credentialSource = $this->serializer()->deserialize(
            base64_decode($storedCredential->public_key),
            PublicKeyCredentialSource::class,
            'json'
        );

        $ceremonyStepManagerFactory = new CeremonyStepManagerFactory;
        $ceremonyStepManager = $ceremonyStepManagerFactory->requestCeremony();

        $validator = AuthenticatorAssertionResponseValidator::create(
            ceremonyStepManager: $ceremonyStepManager,
        );

        $updatedSource = $validator->check(
            credentialId: $publicKeyCredential->rawId,
            authenticatorAssertionResponse: $response,
            publicKeyCredentialRequestOptions: $options,
            host: config('webauthn.rp_id'),
            userHandle: null,
            credentialSource: $credentialSource,
        );

        // Update sign count and last used
        $storedCredential->update([
            'sign_count' => $updatedSource->counter,
            'last_used_at' => now(),
        ]);

        $user = $storedCredential->user;

        if (! $user || ! $user->isActive()) {
            throw new \RuntimeException('User account is not active.');
        }

        return $user;
    }
}
