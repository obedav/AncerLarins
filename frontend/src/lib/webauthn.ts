/**
 * WebAuthn browser utilities for passkey authentication.
 * Handles encoding conversions between server JSON and browser Credential API.
 */

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts server registration options JSON to browser CredentialCreationOptions.
 */
export function prepareCreationOptions(
  options: Record<string, unknown>
): CredentialCreationOptions {
  const publicKey = options as Record<string, unknown>;

  const prepared: PublicKeyCredentialCreationOptions = {
    rp: publicKey.rp as PublicKeyCredentialRpEntity,
    user: {
      ...(publicKey.user as Record<string, unknown>),
      id: base64urlToBuffer((publicKey.user as Record<string, string>).id),
    } as PublicKeyCredentialUserEntity,
    challenge: base64urlToBuffer(publicKey.challenge as string),
    pubKeyCredParams: publicKey.pubKeyCredParams as PublicKeyCredentialParameters[],
    timeout: publicKey.timeout as number | undefined,
    attestation: publicKey.attestation as AttestationConveyancePreference | undefined,
    authenticatorSelection: publicKey.authenticatorSelection as AuthenticatorSelectionCriteria | undefined,
    excludeCredentials: ((publicKey.excludeCredentials as Array<Record<string, unknown>>) || []).map(
      (cred) => ({
        ...cred,
        id: base64urlToBuffer(cred.id as string),
      })
    ) as PublicKeyCredentialDescriptor[],
  };

  return { publicKey: prepared };
}

/**
 * Converts server authentication options JSON to browser CredentialRequestOptions.
 */
export function prepareRequestOptions(
  options: Record<string, unknown>
): CredentialRequestOptions {
  const publicKey = options as Record<string, unknown>;

  const prepared: PublicKeyCredentialRequestOptions = {
    challenge: base64urlToBuffer(publicKey.challenge as string),
    rpId: publicKey.rpId as string | undefined,
    timeout: publicKey.timeout as number | undefined,
    userVerification: publicKey.userVerification as UserVerificationRequirement | undefined,
    allowCredentials: ((publicKey.allowCredentials as Array<Record<string, unknown>>) || []).map(
      (cred) => ({
        ...cred,
        id: base64urlToBuffer(cred.id as string),
      })
    ) as PublicKeyCredentialDescriptor[],
  };

  return { publicKey: prepared };
}

/**
 * Serializes a registration (attestation) browser response to JSON for the server.
 */
export function serializeAttestationResponse(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64url(response.attestationObject),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };
}

/**
 * Serializes a login (assertion) browser response to JSON for the server.
 */
export function serializeAssertionResponse(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferToBase64url(response.authenticatorData),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
  };
}
