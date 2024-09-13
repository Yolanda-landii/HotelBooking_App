import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase'; // Import Firestore db

// Async action to fetch reservations
export const fetchReservations = createAsyncThunk('reservations/fetch', async () => {
  const snapshot = await db.collection('reservations').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});

const reservationSlice = createSlice({
  name: 'reservations',
  initialState: {
    reservations: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    approveReservation: (state, action) => {
      // Logic to approve reservation
    },
    cancelReservation: (state, action) => {
      // Logic to cancel reservation
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { approveReservation, cancelReservation } = reservationSlice.actions;

export default reservationSlice.reducer;
