import { baseApi } from './baseApi';
import type {
  ApiResponse,
  LocationState,
  LocationCity,
  LocationArea,
} from '@/types';
import type { PropertyType } from '@/types';

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
  }),
});

export const {
  useGetStatesQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useGetPropertyTypesQuery,
} = locationApi;
