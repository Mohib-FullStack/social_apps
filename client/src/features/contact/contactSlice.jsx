import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

// ✅ Fetch All Contacts (Admin Feature)
export const fetchContacts = createAsyncThunk(
  "contact/fetchContacts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/contacts/");
      return response.data.payload; // Return the list of contacts
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch contacts");
    }
  }
);

// ✅ Submit Contact Form
// ✅ Submit Contact Form
export const submitContactForm = createAsyncThunk(
  "contact/submitContactForm",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/contacts/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data; // Return the entire response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to submit contact form");
    }
  }
);

// ✅ Contact Slice
const contactSlice = createSlice({
  name: "contact",
  initialState: {
    isLoading: false,
    error: null,
    successMessage: null, // For storing success message after form submission
  },
  reducers: {
    // Clear the contact state (used after showing success/error messages)
    clearContactState: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.messages = action.payload; // Store fetched contacts
        state.isLoading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Store error message
      })

      
       // 🔹 Submit Contact Form
       .addCase(submitContactForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null; // Reset success message
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Backend response:", action.payload); // Debug log

        // Handle different response structures
        if (action.payload.message) {
          state.successMessage = action.payload.message; // Use message field if available
        } else if (action.payload.success) {
          state.successMessage = "Your message has been sent successfully!"; // Fallback message
        } else {
          state.successMessage = "Form submitted successfully!"; // Default message
        }
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Store error message
        console.error("Contact form submission failed:", action.payload); // Debug log
      });
  },
});

export const { clearContactState } = contactSlice.actions;
export default contactSlice.reducer;










