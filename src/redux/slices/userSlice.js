import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateProfile } from '../../utils/firabaseUtils'; // Ensure you have a function to handle profile updates

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
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role,
        favorites: action.payload.favorites || [], // Initialize favorites
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
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role,
        favorites: action.payload.favorites || [], // Initialize favorites
      };
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateFavorites(state, action) {
      if (state.user) {
        state.user.favorites = action.payload; // Update favorites
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload }; // Merge profile updates with user state
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
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
  updateFavorites, // Export the new reducer
} = userSlice.actions;

export default userSlice.reducer;
