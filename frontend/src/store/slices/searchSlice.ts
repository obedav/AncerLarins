import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SearchFilters } from '@/types';

interface SearchState {
  filters: SearchFilters;
}

const initialState: SearchState = {
  filters: {},
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<SearchFilters>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
    removeFilter(state, action: PayloadAction<keyof SearchFilters>) {
      delete state.filters[action.payload];
    },
  },
});

export const { setFilters, clearFilters, removeFilter } = searchSlice.actions;
export default searchSlice.reducer;
