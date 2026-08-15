import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, phone, password }, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.put('/auth/profile', userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/auth/addresses', addressData);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.delete(`/auth/addresses/${addressId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: userInfoFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      })
      // Addresses
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.userInfo) {
          state.userInfo.addresses = action.payload;
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.userInfo) {
          state.userInfo.addresses = action.payload;
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
