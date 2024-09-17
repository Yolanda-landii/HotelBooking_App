import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Import Firestore db instance

// Async action to fetch reservations
export const fetchReservations = createAsyncThunk('reservations/fetch', async () => {
  const querySnapshot = await getDocs(collection(db, 'reservations'));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});

// Async action to approve reservation
export const approveReservation = createAsyncThunk('reservations/approve', async (reservationId) => {
  const reservationRef = doc(db, 'reservations', reservationId);
  await updateDoc(reservationRef, { status: 'approved' });
  const updatedReservation = (await getDoc(reservationRef)).data();
  return { id: reservationId, ...updatedReservation };
});

// Async action to cancel reservation
export const cancelReservation = createAsyncThunk('reservations/cancel', async (reservationId) => {
  const reservationRef = doc(db, 'reservations', reservationId);
  await updateDoc(reservationRef, { status: 'canceled' });
  const updatedReservation = (await getDoc(reservationRef)).data();
  return { id: reservationId, ...updatedReservation };
});
// Add modifyReservation action in reservationsSlice.js
export const modifyReservation = createAsyncThunk(
  'reservations/modify',
  async ({ reservationId, updatedData }) => {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, updatedData);
    const updatedReservation = (await getDoc(reservationRef)).data();
    return { id: reservationId, ...updatedReservation };
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState: {
    reservations: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchReservations actions
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
      })
      // Handle approveReservation actions
      .addCase(approveReservation.fulfilled, (state, action) => {
        const { id, ...updatedReservation } = action.payload;
        const index = state.reservations.findIndex((res) => res.id === id);
        if (index !== -1) {
          state.reservations[index] = { id, ...updatedReservation };
        }
      })
      // Handle cancelReservation actions
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const { id, ...updatedReservation } = action.payload;
        const index = state.reservations.findIndex((res) => res.id === id);
        if (index !== -1) {
          state.reservations[index] = { id, ...updatedReservation };
        }
      })
      .addCase(approveReservation.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Inside your reservationSlice extraReducers:
      .addCase(modifyReservation.fulfilled, (state, action) => {
        const { id, ...updatedReservation } = action.payload;
        const index = state.reservations.findIndex((res) => res.id === id);
        if (index !== -1) {
          state.reservations[index] = { id, ...updatedReservation };
        }
      })
      .addCase(modifyReservation.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default reservationSlice.reducer;
