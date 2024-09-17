import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateProfile, getUserProfile, uploadProfilePicture } from '../../utils/firabaseUtils'; // Add this import

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ uid, profileData, profilePicture }, { rejectWithValue }) => {
    try {
      let profilePictureURL;

      // If there's a profile picture, upload it and get the URL
      if (profilePicture) {
        profilePictureURL = await uploadProfilePicture(uid, profilePicture);
        profileData = { ...profileData, profilePicture: profilePictureURL };
      }

      await updateProfile(uid, profileData);
      return { ...profileData, profilePicture: profilePictureURL };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching user profile data
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (uid, { rejectWithValue }) => {
    try {
      const profileData = await getUserProfile(uid);
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
        favorites: action.payload.favorites || [],
        profilePicture: action.payload.profilePicture || null,
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
        favorites: action.payload.favorites || [],
      };
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateFavorites(state, action) {
      if (state.user) {
        const { hotelId, actionType } = action.payload;
        if (actionType === 'add') {
          state.user.favorites.push(hotelId);
        } else if (actionType === 'remove') {
          state.user.favorites = state.user.favorites.filter(id => id !== hotelId);
        }
      }
    },
    logout(state) {
      state.user = null;
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
        state.user = { ...state.user, ...action.payload }; // Update profile with new data
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
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
  updateFavorites,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
