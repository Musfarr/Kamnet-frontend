import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Start authentication process
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // Successfully authenticated user
    addUser: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      // Store only essential user information
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role || "",
        picture: action.payload.picture || "",
        profileCompleted: action.payload.profileCompleted || false
      };
    },
    
    // Authentication failed
    authFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Log out user
    removeUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    
    // Update role if needed
    updateRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    
    // Update profile completion status
    updateProfileStatus: (state, action) => {
      if (state.user) {
        state.user.profileCompleted = action.payload;
      }
    },
    
    // Clear error message
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  addUser, 
  removeUser, 
  updateRole, 
  authStart, 
  authFail, 
  clearError,
  updateProfileStatus 
} = userSlice.actions;

export default userSlice.reducer;
