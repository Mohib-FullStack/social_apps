import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch resume data
export const fetchResume = createAsyncThunk(
  "resume/fetchResume",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/resume/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch resume");
    }
  }
);

const resumeSlice = createSlice({
  name: "resume",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default resumeSlice.reducer;