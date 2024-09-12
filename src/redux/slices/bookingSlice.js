import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocs, collection, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
// import { getUserProfile, updateProfile } from '../../utils/firebaseUtils';

const initialState = {
  status: 'idle',
  error: null,
};

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (uid, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return bookings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
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

export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingError = (state) => state.booking.error;

export default bookingSlice.reducer;
