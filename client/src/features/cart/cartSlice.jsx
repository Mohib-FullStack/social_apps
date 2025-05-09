import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

//! Fetch Cart Items Good
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      console.log('Fetched cart items:', response.data);
      return response.data; // Ensure response has `payload` field
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch cart items'
      );
    }
  }
);

// ! Add Item to Cart (Updated)
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productSlug, quantity }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        '/cart',
        { productSlug, quantity },
        { withCredentials: true }
      );
      thunkAPI.dispatch(fetchCartItems()); // Refetch cart for consistency
      return response.data.payload;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message === 'Product already in cart'
          ? 'This product is already in your cart.'
          : error.response?.data?.message || 'Failed to add item to cart';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// ! Update Cart Item Quantity (Updated)
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productSlug, quantity }, thunkAPI) => {
    try {
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity: Must be a positive number');
      }
      const response = await axiosInstance.put(
        '/cart',
        { productSlug, quantity },
        { withCredentials: true }
      );
      thunkAPI.dispatch(fetchCartItems());
      return response.data.payload;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update cart item'
      );
    }
  }
);

//! Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/cart/${cartItemId}`, {
        withCredentials: true,
      });
      return cartItemId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to remove item'
      );
    }
  }
);

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalCount: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        const items = action.payload.payload || [];
        state.items = items;
        state.totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalPrice = items.reduce(
          (sum, item) => sum + (item.totalPrice || 0),
          0
        );
        state.isLoading = false;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
      })

      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedItems = action.payload.items;
        state.items = updatedItems;
        state.totalPrice = action.payload.totalPrice;
        state.totalCount = action.payload.totalCount;
      })

      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.totalCount = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        state.isLoading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;