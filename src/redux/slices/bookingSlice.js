// redux/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

const initialState = {
  status: 'idle',
  error: null,
};

// Async thunk for creating a booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      await addDoc(collection(db, 'bookings'), bookingData);
      return bookingData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;

// Selectors
export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingError = (state) => state.booking.error;

export default bookingSlice.reducer;
