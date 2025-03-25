import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../../constants/constants';


export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async (_, { rejectWithValue }) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ROOMS));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addRoom = createAsyncThunk('rooms/addRoom', async (roomData, { rejectWithValue }) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), roomData);
    return { id: docRef.id, ...roomData };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteRoom = createAsyncThunk('rooms/deleteRoom', async (id, { rejectWithValue }) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ROOMS, id));
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.ROOMS, id), updatedData);
      return { id, ...updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const handleAsyncActions = (builder, asyncThunk, successCallback) => {
  builder
    .addCase(asyncThunk.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(asyncThunk.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (successCallback) successCallback(state, action);
    })
    .addCase(asyncThunk.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    });
};


const initialState = {
  rooms: [],
  status: 'idle',
  error: null,
};

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    handleAsyncActions(builder, fetchRooms, (state, action) => {
      state.rooms = action.payload;
    });
    handleAsyncActions(builder, addRoom, (state, action) => {
      state.rooms.push(action.payload);
    });
    handleAsyncActions(builder, deleteRoom, (state, action) => {
      state.rooms = state.rooms.filter((room) => room.id !== action.payload);
    });
    handleAsyncActions(builder, updateRoom, (state, action) => {
      const index = state.rooms.findIndex((room) => room.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    });
  },
});

export default roomSlice.reducer;
