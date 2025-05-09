import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// Helper to extract error messages
const extractErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  'An unexpected error occurred';

//! Create Order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('Creating order with data:', orderData);
      const response = await axiosInstance.post('/order/create', orderData, {
        withCredentials: true,
      });
      console.log('Order created successfully:', response.data.payload);
      return response.data.payload; // Assuming `payload` contains the order
    } catch (error) {
      console.error('Error in createOrder:', error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Pay Order
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/order/pay', paymentData, {
        withCredentials: true,
      });
      return response.data.payload; // Assuming the backend responds with the updated order
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Track Order
export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/order/track/${orderId}`, {
        withCredentials: true,
      });
      console.log('Track order response:', response.data.payload); // Debugging
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Get Current User's Awaiting Payment Order
export const getAwaitingPaymentForCurrentUser = createAsyncThunk(
  'order/getAwaitingPaymentForCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        '/order/awaitingPaymentForCurrentUser',
        {
          withCredentials: true,
        }
      );
      return response.data.payload; // Assuming the backend sends the awaiting payment order under `payload`
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Fetch Orders By Status
export const fetchOrdersByStatus = createAsyncThunk(
  'order/fetchOrdersByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/order', {
        params,
        withCredentials: true,
      });
      return response.data.payload; // Assuming the backend sends the orders under `payload`
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Get All Order Statuses
export const getAllOrderStatuses = createAsyncThunk(
  'order/getAllOrderStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/order/allstatus', {
        withCredentials: true,
      });
      return response.data.payload; // Assuming the backend sends the statuses under `payload`
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

//! Cancel Order
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/order/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );
      return response.data.payload; // Assuming the backend responds with the updated order
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Utility function to update a specific order in state
const updateOrderInState = (state, updatedOrder) => {
  const index = state.orders.findIndex((order) => order.id === updatedOrder.id);
  if (index !== -1) {
    state.orders[index] = updatedOrder;
  }
};

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null, // Correctly defining `currentOrder` for tracking
    allStatuses: [],
    awaitingPaymentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetOrderState: (state) => {
      state.orders = [];
      state.awaitingPaymentOrder = null;
      state.allStatuses = [];
      state.isLoading = false;
      state.error = null;
      state.currentOrder = null; // Reset currentOrder as well
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.push(action.payload); // Adds the new order to the state
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create order.';
      })

      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(payOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.orders = state.orders.map((order) =>
          order.id === action.payload.orderId
            ? { ...order, status: 'PAYED' }
            : order
        );
      })

      .addCase(payOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentOrder = {
          ...action.payload,
          shippingAddress:
            action.payload.shippingAddress || 'No address provided',
          items: action.payload.items || [],
          addressLatLng: action.payload.addressLatLng || { lat: 0, lng: 0 },
        };
      })

      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Awaiting Payment For Current User
      .addCase(getAwaitingPaymentForCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAwaitingPaymentForCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.awaitingPaymentOrder = action.payload; // Sets the active order awaiting payment
      })
      .addCase(getAwaitingPaymentForCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Orders By Status
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload; // Populates orders list based on status
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get All Order Statuses
      .addCase(getAllOrderStatuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrderStatuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allStatuses = action.payload; // Updates the available order statuses
      })
      .addCase(getAllOrderStatuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        updateOrderInState(state, action.payload); // Updates the order with cancel status
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
