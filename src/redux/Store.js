// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';
import favoritesReducer from './slices/favoritesSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    hotels: hotelReducer,
    booking: bookingReducer,
    favorites: favoritesReducer,
    
  },
  // Disable the non-serializable value check (not recommended)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
