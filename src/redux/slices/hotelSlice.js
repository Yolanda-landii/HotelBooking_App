import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Fetch hotels
export const fetchHotels = createAsyncThunk('hotels/fetchHotels', async () => {
  const querySnapshot = await getDocs(collection(db, 'hotels'));
  const hotels = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return hotels;
});

// Add a new hotel
export const addHotel = createAsyncThunk('hotels/addHotel', async (hotelData) => {
  const docRef = await addDoc(collection(db, 'hotels'), hotelData);
  return { id: docRef.id, ...hotelData };
});

// Delete a hotel
export const deleteHotel = createAsyncThunk('hotels/deleteHotel', async (id) => {
  await deleteDoc(doc(db, 'hotels', id));
  return id;
});

// Update a hotel
export const updateHotel = createAsyncThunk('hotels/updateHotel', async ({ id, updatedData }) => {
  await updateDoc(doc(db, 'hotels', id), updatedData);
  return { id, ...updatedData };
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    hotels: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels.push(action.payload);
      })
      .addCase(addHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = state.hotels.filter(hotel => hotel.id !== action.payload);
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.hotels.findIndex(hotel => hotel.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default hotelSlice.reducer;
