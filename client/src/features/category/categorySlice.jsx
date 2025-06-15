import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

const API_URL = '/categories'; // Use a relative path since axiosInstance has baseURL set.

// Create category thunk
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, categoryData);
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch categories thunk
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Update category thunk by slug
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ slug, name }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${slug}`, { name });
      return response.data.payload;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Delete category thunk by slug
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (slug, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/${slug}`);
      return slug;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    status: 'idle',            // Overall status
    fetchStatus: 'idle',       // Status for fetching categories
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.categories.findIndex(
          (cat) => cat.slug === action.payload.slug
        );
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = state.categories.filter(
          (cat) => cat.slug !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
