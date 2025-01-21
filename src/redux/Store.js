// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import roomReducer from './slices/roomSlice';
import bookingReducer from './slices/bookingSlice';
import favoritesReducer from './slices/favoritesSlice';
import reservationsReducer from './slices/reservationsSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    rooms: roomReducer,
    booking: bookingReducer,
    favorites: favoritesReducer,
    reservations:reservationsReducer,
    
  },
  // Disable the non-serializable value check (not recommended)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
