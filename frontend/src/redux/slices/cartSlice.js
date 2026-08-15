import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ bookId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/cart', { bookId, quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ bookId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.put(`/cart/${bookId}`, { quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (bookId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.delete(`/cart/${bookId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.delete('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
