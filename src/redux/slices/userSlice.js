import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateProfile } from '../../utils/firabaseUtils';

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      await updateProfile(profileData.uid, profileData);
      return profileData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      // Store UID, email, and role
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role, // Add role here
      };
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    registerRequest(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      // Store UID, email, and role
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role, // Add role here
      };
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
} = userSlice.actions;

export default userSlice.reducer;
