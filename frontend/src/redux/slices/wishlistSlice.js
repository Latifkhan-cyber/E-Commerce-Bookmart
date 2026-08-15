import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/wishlist');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (bookId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/wishlist', { bookId });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (bookId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.delete(`/wishlist/${bookId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetWishlist: (state) => {
      state.books = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.books = action.payload.books || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.books = action.payload.books || [];
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
