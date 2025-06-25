// src/features/user/userSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
import socketService from '../../utils/socket';

// ==============================================
// ============== INITIAL STATE =================
// ==============================================
const initialState = {
  user: null,
  profile: null,
  publicProfile: null,
  publicProfileStatus: 'idle',
  publicProfileError: null,
  currentUserId: null,
  users: [],
  status: 'idle',
  error: null,
  loggedIn: false,
  isAdmin: false,
  authChecked: false,
  updatePasswordMessage: '',
  resetPasswordMessage: '',
  activationMessage: '',
};

// ==============================================
// ================ SELECTORS ===================
// ==============================================
export const selectCurrentUser = (state) => state.user.user;
export const selectCurrentProfile = (state) => state.user.profile;
export const selectPublicProfile = (state) => state.user.publicProfile;
export const selectPublicProfileStatus = (state) =>
  state.user.publicProfileStatus;
export const selectPublicProfileError = (state) =>
  state.user.publicProfileError;
export const selectIsAdmin = (state) => state.user.isAdmin;
export const selectIsAuthenticated = (state) => state.user.loggedIn;
export const selectAuthChecked = (state) => state.user.authChecked;
export const selectUsers = (state) => state.user.users;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

// ==============================================
// ============== HELPER FUNCTIONS ==============
// ==============================================
const handleRejected = (state, action) => {
  state.status = 'failed';
  state.error = action.payload || 'An error occurred';
  state.authChecked = true;
};

// ==============================================
// =============== ASYNC THUNKS =================
// ==============================================

// ----------------- Auth Related ----------------
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/auth/logout',
        {},
        { withCredentials: true }
      );
      console.log('Logout response:', response);
      socketService.disconnect();
      return true;
    } catch (error) {
      console.error('Logout error:', error?.response?.data || error.message);
      socketService.disconnect();
      return rejectWithValue(error.response?.data || 'Logout failed');
    }
  }
);

export const getProtectedData = createAsyncThunk(
  'user/getProtectedData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/protected');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to access protected data'
      );
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'user/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------- Profile Related ---------------
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/profile/me', {
        withCredentials: true,
      });
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Fetching profile failed');
    }
  }
);

export const fetchPublicProfile = createAsyncThunk(
  'user/fetchPublicProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      if (!response.data?.payload?.id) {
        throw new Error('Invalid profile data structure');
      }
      return response.data.payload;
    } catch (error) {
      const err = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
      };
      return rejectWithValue(err);
    }
  }
);

export const updatePrivateProfile = createAsyncThunk(
  'user/updatePrivateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/users/profile/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCoverImage = createAsyncThunk(
  'user/updateCoverImage',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        '/users/profile/cover',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// -------------- User Management ---------------
export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async ({ search = '', page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users', {
        params: { search, page, limit },
      });
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserById = createAsyncThunk(
  'user/updateUserById',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, userData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------- Password Related --------------
export const forgotPassword = createAsyncThunk(
  'users/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/users/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        '/users/update-password',
        passwords,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update password.' }
      );
    }
  }
);

// -------------- Registration Related ----------
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/users/process-register',
        userData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong!' }
      );
    }
  }
);

export const activateUser = createAsyncThunk(
  'user/activateUser',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/activate', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------- Chat Related -----------------
export const fetchChats = createAsyncThunk(
  'user/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/chats');
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chats');
    }
  }
);

// ==============================================
// ================== SLICE =====================
// ==============================================
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoggedInUser(state, action) {
      state.user = action.payload;
      state.profile = action.payload;
      state.loggedIn = true;
      state.isAdmin = action.payload?.isAdmin || false;
      state.authChecked = true;
    },
    clearPublicProfile(state) {
      state.publicProfile = null;
      state.publicProfileStatus = 'idle';
      state.publicProfileError = null;
    },
    setAuthChecked(state, action) {
      state.authChecked = action.payload;
    },
    resetAuthState(state) {
      Object.assign(state, {
        ...initialState,
        authChecked: true,
      });
      socketService.disconnect();
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loggedIn = true;
        const user = action.payload.user || action.payload;
        state.user = user;
        state.profile = user;
        state.isAdmin = user?.isAdmin || false;
        state.error = null;
        state.status = 'succeeded'; // 🟢 Add this to stop any loaders
      })
      .addCase(loginUser.rejected, handleRejected)

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loggedIn = false;
        state.user = null;
        state.profile = null;
        state.isAdmin = false;
        state.authChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loggedIn = false;
        state.user = null;
        state.profile = null;
        state.isAdmin = false;
      })

      .addCase(getProtectedData.fulfilled, (state, action) => {
        state.protectedData = action.payload;
      })
      .addCase(getProtectedData.rejected, handleRejected)

      // refreshAccessToken
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const user = action.payload.user;
        if (user) {
          state.user = user;
          state.isAdmin = user?.isAdmin || false;
          state.loggedIn = true;
        }
        state.authChecked = true;
      })
      .addCase(refreshAccessToken.rejected, handleRejected)

      //! Profile related reducers
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.currentUserId = action.payload.id;
        state.loggedIn = true;
        state.authChecked = true;
        state.status = 'succeeded';
      })
      .addCase(fetchUserProfile.rejected, handleRejected)

      // fetchPublicProfile
      .addCase(fetchPublicProfile.pending, (state) => {
        state.publicProfileStatus = 'loading';
        state.publicProfileError = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.publicProfileStatus = 'succeeded';
        state.publicProfile = action.payload;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.publicProfileStatus = 'failed';
        state.publicProfileError = action.payload;
        state.publicProfile = null;
      })

      // updatePrivateProfile
      .addCase(updatePrivateProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePrivateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updatePrivateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // updateCoverImage
      .addCase(updateCoverImage.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(updateCoverImage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.user = action.payload.user || state.user;
        state.isAdmin = action.payload.user?.isAdmin || state.isAdmin;
      })
      .addCase(updateCoverImage.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload?.message || action.error.message;
      })

      // User management reducers
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users =
          action.payload.payload?.users || action.payload.users || [];
        state.currentPage =
          action.payload.payload?.pagination?.current ||
          action.payload.currentPage ||
          1;
        state.totalPages =
          action.payload.payload?.pagination?.pages ||
          action.payload.totalPages ||
          1;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAdmin = action.payload?.isAdmin || false;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAdmin = action.payload?.isAdmin || false;
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = state.users.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUser.rejected, handleRejected)

      // Password related reducers
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error =
          action.payload.message || 'Failed to send password reset email';
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.resetPasswordMessage = 'Password has been reset successfully.';
      })
      .addCase(resetPassword.rejected, handleRejected)
      .addCase(updatePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.updatePasswordMessage = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Registration related reducers
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activationMessage =
          action.payload.message || 'Registration successful!';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to register user';
      })
      .addCase(activateUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(activateUser.rejected, handleRejected)

      // Chat related reducers
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      });
  },
});

export const {
  logout,
  setLoggedInUser,
  clearPublicProfile,
  setAuthChecked,
  resetAuthState,
} = userSlice.actions;

export default userSlice.reducer;

//! Original src/features/user/userSlice.js
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';
// import socketService from '../../utils/socket';

// // Helper function for handling rejected actions
// const handleRejected = (state, action) => {
//   state.status = 'failed';
//   state.error = action.payload || 'An error occurred';
// };

// // Selectors
// export const selectCurrentUser = (state) => state.user.user;
// export const selectCurrentProfile = (state) => state.user.profile;
// export const selectPublicProfile = (state) => state.user.publicProfile;
// export const selectPublicProfileStatus = (state) =>
//   state.user.publicProfileStatus;
// export const selectPublicProfileError = (state) =>
//   state.user.publicProfileError;
// export const selectIsAdmin = (state) => state.user.isAdmin;
// export const selectIsAuthenticated = (state) => state.user.loggedIn;
// export const selectUsers = (state) => state.user.users;
// export const selectUserStatus = (state) => state.user.status;
// export const selectUserError = (state) => state.user.error;

// // Async Thunks
// //! Login User
// export const loginUser = createAsyncThunk(
//   'user/loginUser',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post('/auth/login', userData, {
//         withCredentials: true,
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Login failed');
//     }
//   }
// );

// //! Logout User
// export const logoutUser = createAsyncThunk(
//   'user/logoutUser',
//   async (_, { rejectWithValue }) => {
//     try {
//       await axiosInstance.post('/auth/logout', {}, { withCredentials: true });

//       // Disconnect socket after successful logout
//       socketService.disconnect();

//       return true;
//     } catch (error) {
//       // Ensure socket is disconnected even if logout fails
//       socketService.disconnect();
//       return rejectWithValue(error.response?.data || 'Logout failed');
//     }
//   }
// );

// //! Fetch Protected Data
// export const getProtectedData = createAsyncThunk(
//   'user/getProtectedData',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/auth/protected');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || 'Failed to access protected data'
//       );
//     }
//   }
// );

// //! Fetch User Profile
// export const fetchUserProfile = createAsyncThunk(
//   'user/fetchUserProfile',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/users/profile/me', {
//         withCredentials: true,
//       });
//       return response.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Fetching profile failed');
//     }
//   }
// );

// //! Fetch Public Profile
// export const fetchPublicProfile = createAsyncThunk(
//   'user/fetchPublicProfile',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(`/users/profile/${userId}`);
//       if (!response.data?.payload?.id) {
//         throw new Error('Invalid profile data structure');
//       }
//       return response.data.payload;
//     } catch (error) {
//       const err = {
//         message: error.response?.data?.message || error.message,
//         status: error.response?.status || 500,
//       };
//       return rejectWithValue(err);
//     }
//   }
// );

// //! Update Private Profile
// export const updatePrivateProfile = createAsyncThunk(
//   'user/updatePrivateProfile',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put('/users/profile/me', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// //! Update Cover Image
// export const updateCoverImage = createAsyncThunk(
//   'user/updateCoverImage',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(
//         '/users/profile/cover',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// //! Fetch All Users
// export const fetchAllUsers = createAsyncThunk(
//   'user/fetchAllUsers',
//   async ({ search = '', page = 1, limit = 5 }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/users', {
//         params: { search, page, limit },
//       });
//       return response.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Error fetching users');
//     }
//   }
// );

// //! Fetch User By ID
// export const fetchUserById = createAsyncThunk(
//   'user/fetchUserById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(`/users/${id}`);
//       return response.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Update User By ID
// export const updateUserById = createAsyncThunk(
//   'user/updateUserById',
//   async ({ id, userData }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(`/users/${id}`, userData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       return response.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Delete User
// export const deleteUser = createAsyncThunk(
//   'user/deleteUser',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.delete(`/users/${id}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Forgot Password
// export const forgotPassword = createAsyncThunk(
//   'users/forgotPassword',
//   async ({ email }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post('/users/forgot-password', {
//         email,
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// //! Reset Password
// export const resetPassword = createAsyncThunk(
//   'user/resetPassword',
//   async ({ token, password }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put('/users/reset-password', {
//         token,
//         password,
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Update Password
// export const updatePassword = createAsyncThunk(
//   'user/updatePassword',
//   async (passwords, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(
//         '/users/update-password',
//         passwords,
//         {
//           withCredentials: true,
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { message: 'Failed to update password.' }
//       );
//     }
//   }
// );

// //! Refresh Access Token
// export const refreshAccessToken = createAsyncThunk(
//   'user/refreshAccessToken',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post('/auth/refresh-token');
//       return response.data;
//     } catch (error) {
//       if (error.response?.status === 403 || error.response?.status === 401) {
//         return rejectWithValue('Session expired. Please log in again.');
//       }
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Register User
// export const registerUser = createAsyncThunk(
//   'user/registerUser',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post(
//         '/users/process-register',
//         userData,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { message: 'Something went wrong!' }
//       );
//     }
//   }
// );

// //! Activate User
// export const activateUser = createAsyncThunk(
//   'user/activateUser',
//   async ({ token }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post('/users/activate', { token });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// //! Fetch Chats
// export const fetchChats = createAsyncThunk(
//   'user/fetchChats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/chats');
//       return response.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch chats');
//     }
//   }
// );

// const initialState = {
//   user: null,
//   profile: null,
//   publicProfile: null,
//   publicProfileStatus: 'idle',
//   publicProfileError: null,
//   currentUserId: null,
//   users: [],
//   status: 'idle',
//   error: null,
//   loggedIn: false,
//   isAdmin: false,
//   updatePasswordMessage: '',
//   resetPasswordMessage: '',
//   activationMessage: '',
// };

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//    logout(state) {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       state.user = null;
//       state.profile = null;
//       state.loggedIn = false;
//       state.isAdmin = false;
//       state.publicProfile = null;
//       state.publicProfileStatus = 'idle';
//       state.publicProfileError = null;
//     },
//     setLoggedInUser(state, action) {
//       state.user = action.payload;
//       state.loggedIn = true;
//       state.isAdmin = action.payload?.isAdmin || false;
//     },
//     clearPublicProfile(state) {
//       state.publicProfile = null;
//       state.publicProfileStatus = 'idle';
//       state.publicProfileError = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login User
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loggedIn = true;
//         state.user = action.payload.user || action.payload;
//         state.profile = action.payload.user || action.payload; // Ensure profile is set
//         state.isAdmin = action.payload.user?.isAdmin || false;
//         state.error = null;
//       })

//       .addCase(loginUser.rejected, handleRejected)

//       // Logout User
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.loggedIn = false;
//         state.user = null;
//         state.profile = null;
//         state.isAdmin = false;
//       })
//       .addCase(logoutUser.rejected, (state) => {
//         state.loggedIn = false;
//         state.user = null;
//         state.profile = null;
//         state.isAdmin = false;
//       })

//       // Fetch Protected Data
//       .addCase(getProtectedData.fulfilled, (state, action) => {
//         state.protectedData = action.payload;
//       })
//       .addCase(getProtectedData.rejected, handleRejected)

//       // Private profile fetch
//       .addCase(fetchUserProfile.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchUserProfile.fulfilled, (state, action) => {
//         state.profile = action.payload;
//         state.currentUserId = action.payload.id;
//       })

//       .addCase(fetchUserProfile.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       .addCase(updatePrivateProfile.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(updatePrivateProfile.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.profile = action.payload;
//       })
//       .addCase(updatePrivateProfile.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Update Cover Image
//       .addCase(updateCoverImage.pending, (state) => {
//         state.loading = true;
//         state.status = 'loading';
//       })
//       .addCase(updateCoverImage.fulfilled, (state, action) => {
//         state.loading = false;
//         state.status = 'succeeded';
//         state.user = action.payload.user || state.user;
//         state.isAdmin = action.payload.user?.isAdmin || state.isAdmin;
//       })
//       .addCase(updateCoverImage.rejected, (state, action) => {
//         state.loading = false;
//         state.status = 'failed';
//         state.error = action.payload?.message || action.error.message;
//       })

//       // Fetch All Users
//       .addCase(fetchAllUsers.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchAllUsers.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.users =
//           action.payload.payload?.users || action.payload.users || [];
//         state.currentPage =
//           action.payload.payload?.pagination?.current ||
//           action.payload.currentPage ||
//           1;
//         state.totalPages =
//           action.payload.payload?.pagination?.pages ||
//           action.payload.totalPages ||
//           1;
//       })
//       .addCase(fetchAllUsers.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Public profile fetch
//       .addCase(fetchPublicProfile.pending, (state) => {
//         state.publicProfileStatus = 'loading';
//         state.publicProfileError = null;
//       })
//       .addCase(fetchPublicProfile.fulfilled, (state, action) => {
//         state.publicProfileStatus = 'succeeded';
//         state.publicProfile = action.payload;
//         console.log('Stored public profile:', action.payload.id); // Debug log
//       })

//       .addCase(fetchPublicProfile.rejected, (state, action) => {
//         state.publicProfileStatus = 'failed';
//         state.publicProfileError = action.payload;
//         state.publicProfile = null;
//       })

//       // Fetch User By ID
//       .addCase(fetchUserById.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchUserById.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.user = action.payload;
//         state.isAdmin = action.payload?.isAdmin || false;
//       })
//       .addCase(fetchUserById.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Update User By ID
//       .addCase(updateUserById.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(updateUserById.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.user = action.payload;
//         state.isAdmin = action.payload?.isAdmin || false;
//       })
//       .addCase(updateUserById.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Delete User
//       .addCase(deleteUser.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.users = state.users.filter(
//           (user) => user.id !== action.payload.id
//         );
//       })
//       .addCase(deleteUser.rejected, handleRejected)

//       // Forgot Password
//       .addCase(forgotPassword.fulfilled, (state, action) => {
//         state.message = action.payload.message;
//         state.error = null;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.error =
//           action.payload.message || 'Failed to send password reset email';
//         state.message = null;
//       })

//       // Reset Password
//       .addCase(resetPassword.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.resetPasswordMessage = 'Password has been reset successfully.';
//       })
//       .addCase(resetPassword.rejected, handleRejected)

//       // Update Password
//       .addCase(updatePassword.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(updatePassword.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.updatePasswordMessage = action.payload.message;
//       })
//       .addCase(updatePassword.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Refresh Access Token
//       .addCase(refreshAccessToken.fulfilled, (state, action) => {
//         state.loggedIn = true;
//         if (action.payload.user) {
//           state.user = action.payload.user;
//           state.isAdmin = action.payload.user?.isAdmin || false;
//         }
//       })

//       // Register User
//       .addCase(registerUser.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.activationMessage =
//           action.payload.message || 'Registration successful!';
//         state.error = null;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload?.message || 'Failed to register user';
//       })

//       // Activate User
//       .addCase(activateUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })
//       .addCase(activateUser.rejected, handleRejected)

//       // Fetch Chats
//       .addCase(fetchChats.fulfilled, (state, action) => {
//         state.chats = action.payload;
//       });
//   },
// });

// export const { logout, setLoggedInUser } = userSlice.actions;
// export default userSlice.reducer;
