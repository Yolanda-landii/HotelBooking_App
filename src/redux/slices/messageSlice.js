import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocs, collection, addDoc, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const initialState = {
  status: 'idle',
  error: null,
  messages: [],
};

// Fetch messages for a specific booking
export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (bookingId, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'messages'), where('bookingId', '==', bookingId));
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return messages;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const newMessage = { ...messageData, timestamp: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'messages'), newMessage);
      return { id: docRef.id, ...newMessage };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark a message as read
export const markMessageAsRead = createAsyncThunk(
  'message/markMessageAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { read: true });
      return { id: messageId, read: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const message = state.messages.find(msg => msg.id === action.payload.id);
        if (message) {
          message.read = true;
        }
      });
  },
});

export const { clearMessageError } = messageSlice.actions;
export const selectMessages = (state) => state.message.messages;
export default messageSlice.reducer;
