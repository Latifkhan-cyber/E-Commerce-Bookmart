import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post('/orders', orderData);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/orders/my-orders');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchOrderDetails = createAsyncThunk('orders/fetchOrderDetails', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get(`/orders/${orderId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.put(`/orders/${orderId}/cancel`);
    return data.order;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    createdOrder: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.createdOrder = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.createdOrder = action.payload;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchMyOrders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchOrderDetails
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // cancelOrder
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
