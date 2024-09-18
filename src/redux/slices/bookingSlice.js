import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocs, collection, query, where, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const initialState = {
  status: 'idle',
  error: null,
  bookings: [], // Initialize bookings state
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

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      return { id: docRef.id, ...bookingData }; // Return the new booking with ID
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all bookings
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = await Promise.all(
        querySnapshot.docs.map(async (bookingDoc) => {
          const bookingData = bookingDoc.data();
          const bookingId = bookingDoc.id;

          // Fetch user details using the userId from the booking data
          const userRef = doc(db, 'users', bookingData.userId);
          const userSnapshot = await getDoc(userRef);
          const userData = userSnapshot.exists() ? userSnapshot.data() : {};

          return {
            id: bookingId,
            ...bookingData,
            user: userData,
          };
        })
      );

      return bookings;
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
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.bookings.push(action.payload); // Add new booking to the state
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload; // Set bookings to fetched data
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAllBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload; // Set bookings to fetched data
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;

export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingError = (state) => state.booking.error;
export const selectBookings = (state) => state.booking.bookings; // Selector for bookings

export default bookingSlice.reducer;
