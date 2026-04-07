import { baseApi } from './baseApi';
import type { ApiResponse, User, AuthTokens } from '@/types';

interface PasskeyCredential {
  id: string;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      ApiResponse<{ user: User }>,
      { first_name: string; last_name: string; phone: string; email?: string; role?: string; channel?: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    login: builder.mutation<ApiResponse<null>, { phone?: string; email?: string; channel?: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    verifyOtp: builder.mutation<
      ApiResponse<{ user: User } & AuthTokens>,
      { phone?: string; email?: string; code: string; purpose: string }
    >({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),

    refreshToken: builder.mutation<
      ApiResponse<AuthTokens>,
      { refresh_token: string }
    >({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/me',
      providesTags: ['User'],
    }),

    // ── Passkey endpoints ──────────────────────────────
    passkeyAuthOptions: builder.mutation<
      ApiResponse<{ challenge_id: string; options: Record<string, unknown> }>,
      void
    >({
      query: () => ({ url: '/passkeys/authenticate/options', method: 'POST' }),
    }),

    passkeyAuthenticate: builder.mutation<
      ApiResponse<{ user: User } & AuthTokens>,
      { challenge_id: string; credential: Record<string, unknown> }
    >({
      query: (body) => ({ url: '/passkeys/authenticate', method: 'POST', body }),
    }),

    passkeyRegisterOptions: builder.mutation<
      ApiResponse<{ challenge_id: string; options: Record<string, unknown> }>,
      void
    >({
      query: () => ({ url: '/passkeys/register/options', method: 'POST' }),
    }),

    passkeyRegister: builder.mutation<
      ApiResponse<{ id: string; device_name: string; created_at: string }>,
      { challenge_id: string; credential: Record<string, unknown>; device_name?: string }
    >({
      query: (body) => ({ url: '/passkeys/register', method: 'POST', body }),
      invalidatesTags: ['Passkey'],
    }),

    listPasskeys: builder.query<ApiResponse<PasskeyCredential[]>, void>({
      query: () => '/passkeys',
      providesTags: ['Passkey'],
    }),

    deletePasskey: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/passkeys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Passkey'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
  usePasskeyAuthOptionsMutation,
  usePasskeyAuthenticateMutation,
  usePasskeyRegisterOptionsMutation,
  usePasskeyRegisterMutation,
  useListPasskeysQuery,
  useDeletePasskeyMutation,
} = authApi;
