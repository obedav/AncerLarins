import { baseApi } from './baseApi';
import type { ApiResponse, User, AuthTokens } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      ApiResponse<{ user: User }>,
      { first_name: string; last_name: string; phone: string; email?: string; role?: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    login: builder.mutation<ApiResponse<null>, { phone: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    verifyOtp: builder.mutation<
      ApiResponse<{ user: User } & AuthTokens>,
      { phone: string; code: string; purpose: string }
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
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
