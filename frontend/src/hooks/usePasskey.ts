'use client';

import { useCallback, useState } from 'react';
import {
  usePasskeyAuthOptionsMutation,
  usePasskeyAuthenticateMutation,
  usePasskeyRegisterOptionsMutation,
  usePasskeyRegisterMutation,
} from '@/store/api/authApi';
import {
  isWebAuthnSupported,
  prepareCreationOptions,
  prepareRequestOptions,
  serializeAttestationResponse,
  serializeAssertionResponse,
} from '@/lib/webauthn';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export function usePasskeyLogin() {
  const [getOptions] = usePasskeyAuthOptionsMutation();
  const [authenticate] = usePasskeyAuthenticateMutation();
  const { loginSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (): Promise<User | null> => {
    if (!isWebAuthnSupported()) {
      setError('Passkeys are not supported in this browser.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get authentication options from server
      const optionsResult = await getOptions().unwrap();
      const { challenge_id, options } = optionsResult.data;

      // Step 2: Prompt browser for passkey
      const credential = await navigator.credentials.get(
        prepareRequestOptions(options)
      ) as PublicKeyCredential | null;

      if (!credential) {
        setError('Passkey authentication was cancelled.');
        return null;
      }

      // Step 3: Send assertion to server for verification
      const result = await authenticate({
        challenge_id,
        credential: serializeAssertionResponse(credential),
      }).unwrap();

      // Step 4: Update auth state
      loginSuccess(result.data.user);
      return result.data.user;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      const message = apiErr?.data?.message || 'Passkey authentication failed. Please try again.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getOptions, authenticate, loginSuccess]);

  return { login, isLoading, error, clearError: () => setError(null) };
}

export function usePasskeyRegister() {
  const [getOptions] = usePasskeyRegisterOptionsMutation();
  const [register] = usePasskeyRegisterMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPasskey = useCallback(async (deviceName?: string): Promise<boolean> => {
    if (!isWebAuthnSupported()) {
      setError('Passkeys are not supported in this browser.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get registration options from server
      const optionsResult = await getOptions().unwrap();
      const { challenge_id, options } = optionsResult.data;

      // Step 2: Prompt browser to create passkey
      const credential = await navigator.credentials.create(
        prepareCreationOptions(options)
      ) as PublicKeyCredential | null;

      if (!credential) {
        setError('Passkey registration was cancelled.');
        return false;
      }

      // Step 3: Send attestation to server for verification
      await register({
        challenge_id,
        credential: serializeAttestationResponse(credential),
        device_name: deviceName,
      }).unwrap();

      return true;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      const message = apiErr?.data?.message || 'Passkey registration failed. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getOptions, register]);

  return { registerPasskey, isLoading, error, clearError: () => setError(null) };
}
