import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type { Property } from '@/types';

interface PropertyState {
  properties: Property[];
  featured: Property[];
  current: Property | null;
  loading: boolean;
  error: string | null;
  meta: { current_page: number; last_page: number; total: number } | null;
}

const initialState: PropertyState = {
  properties: [],
  featured: [],
  current: null,
  loading: false,
  error: null,
  meta: null,
};

export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/properties', { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchFeatured = createAsyncThunk('property/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/properties/featured');
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured');
  }
});

export const fetchProperty = createAsyncThunk(
  'property/fetchOne',
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/properties/${slug}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Property not found');
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchProperty.pending, (state) => { state.loading = true; })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrent } = propertySlice.actions;
export default propertySlice.reducer;
