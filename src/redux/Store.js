// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    hotels: hotelReducer,
    booking: bookingReducer,
    
  },
  // Disable the non-serializable value check (not recommended)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
