// favoritesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [],
  reducers: {
    setFavorites(state, action) {
      return action.payload;
    },
  },
});

export const { setFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
