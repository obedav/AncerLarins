import { baseApi } from './baseApi';
import type {
  ApiResponse,
  LocationState,
  LocationCity,
  LocationArea,
  AreaInsights,
  AreaTrendsResponse,
} from '@/types';
import type { PropertyType, ListingType } from '@/types';

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query<ApiResponse<LocationState[]>, void>({
      query: () => '/locations/states',
    }),

    getCities: builder.query<ApiResponse<LocationCity[]>, string>({
      query: (stateId) => `/locations/states/${stateId}/cities`,
    }),

    getAreas: builder.query<ApiResponse<LocationArea[]>, string>({
      query: (cityId) => `/locations/cities/${cityId}/areas`,
    }),

    getPropertyTypes: builder.query<ApiResponse<PropertyType[]>, void>({
      query: () => '/property-types',
    }),

    getAreaInsights: builder.query<ApiResponse<AreaInsights>, string>({
      query: (areaId) => `/areas/${areaId}/insights`,
    }),

    getAreaTrends: builder.query<ApiResponse<AreaTrendsResponse>, { areaId: string; listingType: ListingType }>({
      query: ({ areaId, listingType }) => `/areas/${areaId}/trends?listing_type=${listingType}`,
    }),

    submitAreaReview: builder.mutation<ApiResponse<{ id: string }>, {
      areaId: string;
      overall: number;
      safety: number;
      transport: number;
      amenities: number;
      noise: number;
      comment?: string;
      lived_duration?: string;
    }>({
      query: ({ areaId, ...body }) => ({
        url: `/areas/${areaId}/reviews`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetStatesQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useGetPropertyTypesQuery,
  useGetAreaInsightsQuery,
  useGetAreaTrendsQuery,
  useSubmitAreaReviewMutation,
} = locationApi;
