import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';
import type {
  SubscriptionPlan,
  CurrentSubscription,
  PaystackInitResponse,
} from '@/types/subscription';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ApiResponse<SubscriptionPlan[]>, void>({
      query: () => '/subscription/plans',
    }),

    getCurrentSubscription: builder.query<ApiResponse<CurrentSubscription>, void>({
      query: () => '/agent/subscription/current',
      providesTags: ['Subscription'],
    }),

    initializeSubscription: builder.mutation<ApiResponse<PaystackInitResponse>, { tier: string }>({
      query: (body) => ({
        url: '/agent/subscription/initialize',
        method: 'POST',
        body,
      }),
    }),

    verifyPayment: builder.mutation<ApiResponse<unknown>, { reference: string }>({
      query: (body) => ({
        url: '/agent/subscription/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', { type: 'Agent', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useInitializeSubscriptionMutation,
  useVerifyPaymentMutation,
} = subscriptionApi;
