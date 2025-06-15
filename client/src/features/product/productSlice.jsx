import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../axiosInstance'

const API_URL = '/products' // Base path for products API requests

// Thunks for Product CRUD operations

//! Create Product thunk
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Failed to create product:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      )
    }
  }
)

//! Fetch All Products
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL)
      return response.data.payload // Assuming 'payload' contains product data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Fetching products failed')
    }
  }
)

//! Fetch Single Product by slug
export const fetchProductBySlug = createAsyncThunk(
  'product/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${slug}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Product not found' }
      )
    }
  }
)
// //! Update Product thunk by slug
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/products/${slug}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensures image data is handled
        },
      })

      // Log the entire response to understand its structure
      console.log('Complete Response:', response.data)

      // Adjust this based on the actual structure returned by your API
      if (response.data) {
        return response.data // Return the complete response directly
      } else {
        throw new Error('Response does not contain expected data')
      }
    } catch (error) {
      console.error('Error in updateProduct thunk:', error.response?.data) // Log the error for debugging
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product.'
      )
    }
  }
)

//! deleting image
export const deleteProductImage = createAsyncThunk(
  'product/deleteProductImage',
  async (publicId, { rejectWithValue }) => {
    try {
      // Imagine you add some logic here in the future, like an API call
      return publicId // return the publicId to remove it from the state
    } catch (error) {
      console.error('Error deleting image:', error.message) // Log the error
      return rejectWithValue('Failed to delete image from Cloudinary')
    }
  }
)

//! Delete Product thunk by slug
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (slug, { rejectWithValue }) => {
    try {
      // Make DELETE request to the server
      await axiosInstance.delete(`${API_URL}/${slug}`, {
        withCredentials: true,
      })
      return slug // Return the slug to remove the product from the Redux store
    } catch (error) {
      console.error('Delete product error:', error.response?.data?.message)
      return rejectWithValue(
        error.response?.data?.message || 'Unexpected error occurred'
      )
    }
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    product: null, // For storing a single product
    loading: false,
    error: null,
    successMessage: null,
    status: 'idle',
  },
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.successMessage = 'Product created successfully!'
        state.products.push(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create product'
      })
      // Fetch All Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload.products

        state.currentPage = action.payload.currentPage
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Fetch Single Product by Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      // .addCase(fetchProductBySlug.fulfilled, (state, action) => {
      //   state.status = 'succeeded'
      //   state.products = action.payload // Adjusted based on your state structure
      // })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.product = action.payload.payload // Store the payload as the product
      })

      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updatedProduct = action.payload.product
        const index = state.products.findIndex(
          (product) => product.slug === updatedProduct.slug
        )
        if (index !== -1) {
          state.products[index] = updatedProduct // Replace the product with the updated one
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Delete Image from Cloudinary
      .addCase(deleteProductImage.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false
        // Here you can update the state, remove the product image, etc.
        // For example:
        state.products = state.products.map((product) =>
          product.imagePublicId === action.payload
            ? { ...product, image: null }
            : product
        )
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product.slug !== action.payload
        )
        state.successMessage = 'Product deleted successfully'
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete product'
      })
  },
})

export const { clearSuccessMessage, clearError } = productSlice.actions

export default productSlice.reducer
