// favoritesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: [],
    reducers: {
      setFavorites(state, action) {
        return action.payload;
      },
      toggleFavorite(state, action) {
        const hotelId = action.payload;
        if (state.includes(hotelId)) {
          return state.filter(id => id !== hotelId);
        } else {
          state.push(hotelId);
        }
      }
    },
  });
  
  export const { setFavorites, toggleFavorite } = favoritesSlice.actions;
  export default favoritesSlice.reducer;
  