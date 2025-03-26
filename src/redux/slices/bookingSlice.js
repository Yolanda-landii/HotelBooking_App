import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocs, collection, query, where, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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
  async (bookingData) => {
    try {
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      return {
        id: bookingRef.id,
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }
);

export const approveBooking = createAsyncThunk(
  'booking/approveBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'approved' });
      return { id: bookingId, status: 'approved' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'canceled' });
      return { id: bookingId, status: 'canceled' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching all bookings...');
      // Get all bookings
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      
      if (bookingsSnapshot.empty) {
        console.log('No bookings found');
        return [];
      }

      // Map through bookings and fetch user details for each
      const bookingsWithUsers = await Promise.all(
        bookingsSnapshot.docs.map(async (bookingDoc) => {
          const booking = { id: bookingDoc.id, ...bookingDoc.data() };
          console.log('Processing booking:', booking);

          if (booking.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', booking.userId));
              if (userDoc.exists()) {
                booking.user = userDoc.data();
              } else {
                console.log('User not found for booking:', booking.id);
                booking.user = { displayName: 'Unknown User', email: 'No email' };
              }
            } catch (error) {
              console.error('Error fetching user for booking:', booking.id, error);
              booking.user = { displayName: 'Error loading user', email: 'Error loading email' };
            }
          } else {
            console.log('No userId for booking:', booking.id);
            booking.user = { displayName: 'No User', email: 'No email' };
          }

          return booking;
        })
      );

      console.log('Fetched bookings with users:', bookingsWithUsers);
      return bookingsWithUsers;
    } catch (error) {
      console.error('Error in fetchAllBookings:', error);
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.status = 'succeeded';
    },
    clearBookingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
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

export const { setBookings, clearBookingError } = bookingSlice.actions;

export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingError = (state) => state.booking.error;
export const selectBookings = (state) => state.booking.bookings; // Selector for bookings

export default bookingSlice.reducer;
