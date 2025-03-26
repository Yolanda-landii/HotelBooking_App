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
        const roomId = action.payload;
        if (state.includes(roomId)) {
          return state.filter(id => id !== roomId);
        } else {
          state.push(roomId);
        }
      }
    },
  });
  
  export const { setFavorites, toggleFavorite } = favoritesSlice.actions;
  export default favoritesSlice.reducer;
  