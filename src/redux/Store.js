// redux/Store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import roomReducer from './slices/roomSlice';
import userReducer from './slices/userSlice';
import favoritesReducer from './slices/favoritesSlice';
import reservationsReducer from './slices/reservationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    rooms: roomReducer,
    user: userReducer,
    favorites: favoritesReducer,
    reservations: reservationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
