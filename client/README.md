### process

npm install socket.io-client
npm install @mui/x-date-pickers@6.19.2 date-fns@2.30.0 --legacy-peer-deps --save-exact

npm install react-phone-number-input libphonenumber-js --force

npm install react-confetti react-use --force

Lessons:

1. Demo And Installation
   Install NodeJs
   Install Visual Studio Code
   Install Git
2. Creating React App
   Create React App
   Remove Unnecessary Codes
3. Adding Header
   Add Header.js
   Use Header in App.js
   Install react-router-dom in frontend
   Add header.module.css
   Use BrowserRouter inside index.js
   Update Header.js
   Update header.module.css
4. Adding Thumbnails
   Add HomePage component
   Add AppRoutes component
   Use AppRoutes in App.js
   Add data.js
   Add food Images
   Add foodService.js
   Update HomePage.js
   Add Reducer
   Load foods
   Add Thumbnails.js
   Add CSS File
   Add Image
   Add Title
   Add Favorite Icon
   Add StarRating.js
   Add Star Images
   Add CSS
   Add Origins
   Add Cook Time
   Add Price.js
   Update CSS File
5. Adding Search
   Add Search Route to AppRoutes.js
   Add Search function to foodService.js
   Use Search Inside HomePage.js
   Add Search Component
   Add CSS
   6.Adding Tags Bar
   Showing The Tags:
   Add sample_tags to data.js
   Add getAllTags function to foodService.js
   Add Tags Component
   Add Css
   Use Tags Component in HomePage.js
   Showing Foods By Tag
   Add Tag route to AppRoutes.js
   Add getAllByTag function to foodService.js
   Use tag param in HomePage.js
6. Food Page
   Create FoodPage Component
   Add route to AppRoutes.js
   Add getById function to foodService.js
   Update FoodPage Component
   Load food
   Create Template
   Add Css
7. Cart Page
   Create Cart Page Component
   Create css
   Add cart route to the Routes
   Create useCart Hook
   Add CartProvider to index.js
   Initialize cart with sample foods
   Update Cart Page Compnent
   useCart hook
   Add Title Component
   Add JSX
   Add CSS
   Update useCart Hook
   Add to cart
   Remove from cart
   Change quantity
   Saving To LocalStorage
   In Food Page useCart for Add to cart buttons
   In Header useCart for cart total count
   9.Not Found!
   Create NotFound Component
   Add CSS
   Add Not Found To:
   Home Page
   Food Page
   Cart Page
   Fixing Search Issue
8. Connect To Backend
   Create backend folder
   Initializing NPM Project
   Copy data.ts to backend/src
   npm install express cors
   Create .gitignore
   Create server.js
   Add & Config Express
   Add & Config Cors
   Add Food Router
   Add jsconfig.json
   Add Apis
   npm install nodemon
   Add dev Script into the package.json
   npm run dev
   Add axios package
   axiosConfig.js file
   Connect food service to the Apis
9. Login Page
   Backend
   Create User Router
   npm install jsonwebtoken
   Add Login Api
   Add sample_users to data.js
   Add httpStatus.js
   Add generateTokenResponse function
   Add User Router To server.js
   Frontend
   Create user service
   Add getUser function
   Add login function
   Add logout function
   npm install react-toastify
   Create useAuth hook
   Add user state
   Add Login function
   Add logout function
   Create LoginPage component
   Add to AppRoutes.js
   Create Custom Components
   Input Container
   CSS
   Input
   CSS
   Button
   CSS
   Add useAuth to the Header component
10. Connecting MongoDB
    Installation
    Install Mongo Db Community
    Windows
    Macos
    Coding
    Install mongoose
    Add User Model
    Add Food Model
    Add .env file
    Install dotenv
    Add MONGO_URI
    Add to .gitignore
    Add database.config.js
    Connect to mongodb
    Seed Users
    Install bcryptjs for password hashing
    Seed Foods
    Update user.router ( Using UserModel)
    Install express-async-handler
    Login Api
    generateTokenResponse
    Update food.router (Using FoodModel):
    Root Api ( Loading all foods )
    Tags api
    Search Api
    FoodId api ( Finding food by id )
    Fix Image url in:
    Thumnails compnent
    Food Page component
    Cart Page component
11. Register Page
    Add Register Page Component
    Add to AppRoutes
    Add Link to login page
    CSS
    Add '/register' api to user.router.js
    Add register function in userService
    Add register function in useAuth hook
    Add to Register page
12. Loading
    Create useLoading hook
    Add LoadingProvider to index.js
    Create Loading component
    Add to App.js
    Add Image
    CSS
    Create Loading Interceptor
13. Checkout Page
    Fixing Loading problem

Create Checkout Page component

Create AuthRoute
Add to Routes
Add css
Create Order Items List
Create Maps Component
Install leaflet & react-leaflet
Adding images to public folder
Fixing header menu problem with map
Create Order router

Create auth middleware
Add UNAUTHORIZED http statuss
Add to Order router
Create Order Model
Create Order Status
Add to server.js
Connecting Frontend to Backend

Create order service
Add create function
Create Auth interceptor
Add to index.js 16. Payment Page
Create PaymentPage component
Add to Routes
CSS
Update Order Router
Add newOrderForCurrentUser
Add pay api
Create PaypalButtons Component
npm install @paypal/react-paypal-js
Add clearCart to useCart
Get clientId
Create Sandbox user for testing 17. Order Track Page
Create Order Track Page
Add To Routes
CSS
Create DateTime Component
Complete
Map
Fixing Marker Icon Issue
Complete
Order Router
Add ‘track/:id’ api
Add to orderService
18.Profile Page
Create ProfilePage Component
CSS
Update Profile
ChangePassword component
Update useAuth hook
Add updateProfile function
Add changePassword function
Update userService
Add updateProfile funciton
Add changePassword function
Update User Router
Add updateProfile api
Add changePassword api 19. Orders Page
Create Orders Page
Add To Routes
CSS
Update Order Service
Add getAll function
Add getAllStatus function
Update Order Router
Add /:status?
Add /allStatus/:id

#####################################################################################

/src
App/store.jsx
/components
/Navbar - Navbar.jsx
/Home - Home.jsx
/ContactUs - ContactUs.jsx
/Profile - Profile.jsx
/Dashboard - Dashboard.jsx
/Register - Register.jsx
/Login - Login.jsx
/Cart - Cart.jsx
/Footer - Footer.jsx
/assets
/images - default-avatar.png (placeholder for profile image)
/features/user/userSlice.js
/features/auth/authSlice.js (auth is for login,logout)
/features/cart/cartSlice.js
/features/product/product.js
/features/snackbar/GlobalSnackbar.jsx, snackbarSlice.jsx

/pages - HomePage.jsx - ProfilePage.jsx - DashboardPage.jsx
/App.js
/main.js

For an eCommerce website, it's important to prioritize user experience, usability, and scalability. Below are some best practices and recommendations for designing the structure and components for your eCommerce website, along with how you can organize the navigation and user interactions:

### 1. **Navbar Design**:

The Navbar is one of the most important parts of the eCommerce site, and here are some design elements you should include:

- **Responsive Design**: Ensure that the Navbar collapses into a hamburger menu on mobile devices for a clean and easy-to-navigate layout.
- **Dropdowns for Categories**: Use dropdowns to display product categories or collections, and make it easy to explore subcategories.
- **Quick Access Links**: Include links to key sections like _Home, Shop, Contact Us, Profile, Cart,_ and _Login/Register_.
- **Profile Dropdown with Image**: Once the user logs in, a dropdown should appear with their profile image, which can have links to _Profile, Orders, Wishlist_, and _Logout_.

### 2. **Profile Component**:

- **Profile Image**: Let users upload and display a profile picture, which will appear on the Navbar and Profile page.
- **User Information**: Show detailed user information such as name, email, and contact number, along with the ability to edit it.
- **Order History**: Add a section for viewing previous orders and their statuses.
- **Wishlist**: Let users save products they like for future purchases.
- **Profile Settings**: Include options for password reset, address management, and other settings.

### 3. **Dashboard Component**:

For logged-in users, the dashboard can be a central hub. It should have:

- **Order Summary**: A section for recent orders with tracking info and quick actions (e.g., reordering).
- **Account Info**: Editable sections for account details.
- **Wishlist**: A list of favorited products.
- **Address Book**: Allow users to manage their shipping/billing addresses.

### 4. **Home Component**:

- **Hero Section**: Use a large, visually striking hero section with a prominent CTA like "Shop Now."
- **Featured Products**: Include sections for new arrivals, trending products, and best sellers.
- **Offers/Banners**: Display current deals or promotions.
- **Search Bar**: Implement a search bar with autosuggestions for quick product searches.

### 5. **Contact Us**:

- **Contact Form**: A simple form for users to submit inquiries.
- **Live Chat**: Include a live chat option for real-time support.
- **Support Information**: Add phone numbers, emails, and office addresses for easy contact.

### 6. **Register/Login**:

- **Social Logins**: Let users log in via Google, Facebook, or Apple to simplify the process.
- **Validation**: Provide real-time validation for forms with clear error messages.
- **Login/Register on the Navbar**: Make login/register links prominent on the Navbar for easy access.

### 7. **Profile Image Handling**:

- **Profile Picture Upload**: Include the ability to upload and update a profile image. Use services like Gravatar or integrate with cloud storage solutions to store user profile pictures.
- **Avatar Placeholder**: If the user doesn't have a profile image, show a default avatar icon.

### 8. **Footer Design**:

- **Important Links**: Include links to _About Us, Contact Us, Privacy Policy, Terms of Service, Shipping Information, and Returns_.
- **Social Media Icons**: Display icons that link to the store's social media profiles.
- **Newsletter Subscription**: Provide a simple form for users to subscribe to your newsletter.

---

### Suggested Design Architecture:

1. **File Structure**:

   ```
   /components
     /Navbar
     /Home
     /ContactUs
     /Profile
     /Dashboard
     /Register
     /Login
     /Cart
     /Footer
   /assets
     /images (for static images like profile avatars, banners, etc.)
   /redux
     /slices (userSlice.js, cartSlice.js, etc.)
   /pages
     /HomePage.jsx
     /ProfilePage.jsx
     /DashboardPage.jsx
   /routes
     /PrivateRoute.jsx
   ```

2. **Component Breakdown**:
   - **Navbar.jsx**: Dynamic based on login status (shows profile if logged in, login/register otherwise).
   - **HomePage.jsx**: Central homepage with product categories, featured products, and CTA.
   - **ProfilePage.jsx**: Editable user profile with image upload and other info.
   - **DashboardPage.jsx**: User's dashboard showing orders, account settings, and wishlist.
   - **Register/Login.jsx**: Form validation and social login.
   - **PrivateRoute.jsx**: A higher-order component to handle protected routes like _Profile_ or _Dashboard_.

### Example Flow with Profile Image and Navbar:

#### `Navbar.jsx`:

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Avatar, Menu, MenuItem, Button } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <Link to="/contact-us">Contact Us</Link>

      {isAuthenticated ? (
        <>
          <Avatar
            onClick={handleMenuClick}
            src={user?.profileImageUrl || '/default-avatar.png'}
            alt={user?.name || 'User'}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={() => navigate('/dashboard')}>
              Dashboard
            </MenuItem>
            <MenuItem>Logout</MenuItem>
          </Menu>
        </>
      ) : (
        <Button onClick={() => navigate('/login')}>Login/Register</Button>
      )}
    </nav>
  );
};

export default Navbar;
```

#### `Profile.jsx`:

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/userSlice';
import { Button, TextField, Avatar } from '@mui/material';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
  });

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle image upload logic, e.g., uploading to cloud storage and saving the URL
    }
  };

  const handleSubmit = () => {
    dispatch(updateUserProfile(profileData));
  };

  return (
    <div>
      <h1>Profile</h1>
      <Avatar
        src={profileData.profileImageUrl || '/default-avatar.png'}
        alt={profileData.name}
      />
      <input type="file" onChange={handleImageUpload} />

      <TextField
        label="Name"
        name="name"
        value={profileData.name}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        value={profileData.email}
        onChange={handleChange}
      />

      <Button onClick={handleSubmit}>Update Profile</Button>
    </div>
  );
};

export default Profile;
```

### Conclusion:

To sum up:

- Use a **dynamic Navbar** that changes based on whether the user is logged in.
- **Profile image upload** and display enhance personalization.
- Use **modular components** for scalability.
- Keep the design clean with hover effects, dropdowns, and a clear structure.
- Follow modern UI/UX patterns for better user experience across desktop and mobile devices.

Let me know if you want to proceed with any specific part of this structure, and I can help further!

###### PROFILE

To implement the **Profile Dropdown with Image** and the **Profile Component** features, we will break the task down step-by-step.

### 1. **Profile Dropdown with Image in Navbar**:

Once the user logs in, the Navbar will display a profile image, which will show a dropdown menu with links to the user's profile, orders, wishlist, and a logout button.

Here’s how we can update the **Navbar** component to achieve this:

#### Updated Navbar Component (`Navbar.jsx`):

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Button, Menu, MenuItem } from '@mui/material';
import { logoutUser } from '../features/auth/authSlice'; // Import logout action
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/'); // Redirect to home after logout
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        E-Shop
      </Link>
      <div className="nav-links">
        <Link to="/shop">Shop</Link>
        <Link to="/contact-us">Contact Us</Link>
        <Link to="/cart">Cart</Link>
      </div>

      <div className="auth-section">
        {isAuthenticated ? (
          <>
            <Avatar
              onClick={handleMenuClick}
              src={user?.profileImageUrl || '/assets/images/default-avatar.png'} // Display profile image
              alt={user?.name || 'User'}
              className="profile-avatar"
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
              <MenuItem onClick={() => navigate('/orders')}>Orders</MenuItem>
              <MenuItem onClick={() => navigate('/wishlist')}>
                Wishlist
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

### 2. **Profile Component**:

The **Profile** component will allow users to upload a profile image, edit their information, view order history, manage a wishlist, and access profile settings like resetting the password or updating their address.

#### Profile Page (`Profile.jsx`):

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, TextField, Avatar } from '@mui/material';
import { uploadProfileImage, updateUserInfo } from '../features/user/userSlice';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Display selected image
        dispatch(uploadProfileImage(file)); // Dispatch action to save image to the server
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedInfo = { name, email, contactNumber };
    dispatch(updateUserInfo(updatedInfo)); // Dispatch action to update user info
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-section">
        <div className="profile-image">
          <Avatar
            src={profileImage || '/assets/images/default-avatar.png'}
            alt="Profile"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="file-input"
          />
        </div>

        <div className="profile-info">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            disabled // Email shouldn't be editable
          />
          <TextField
            label="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="order-history">
        <h3>Order History</h3>
        {/* Display user's order history */}
      </div>

      <div className="wishlist">
        <h3>Wishlist</h3>
        {/* Display user's wishlist */}
      </div>

      <div className="profile-settings">
        <h3>Profile Settings</h3>
        <Button variant="outlined" onClick={() => navigate('/update-password')}>
          Change Password
        </Button>
        <Button variant="outlined" onClick={() => navigate('/manage-address')}>
          Manage Address
        </Button>
      </div>
    </div>
  );
};

export default Profile;
```

### Key Features of **Profile Component**:

1. **Profile Image**: Users can upload a profile image that is displayed both in the Navbar and on the Profile page.
2. **User Information**: Display and allow editing of user information, including the name, contact number, and email (email is read-only).
3. **Order History**: Display a list of past orders (you’ll need to fetch this from your backend).
4. **Wishlist**: Display a user's wishlist items.
5. **Profile Settings**: Options to reset the password and manage the user's address.

### 3. **Redux Slice for User Profile**:

You’ll need to add actions and reducers to handle updating the user’s profile information and uploading their profile image.

#### Updated `userSlice.js`:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Upload Profile Image
export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post(
        'http://localhost:3001/api/user/uploadProfileImage',
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);

// Update User Information
export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async (userInfo, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        'http://localhost:3001/api/user',
        userInfo
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);

// User Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upload Profile Image
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.user.profileImageUrl = action.payload.profileImageUrl;
      })
      // Update User Info
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export default userSlice.reducer;
```

### Summary of Features:

- **Navbar** now displays a dropdown with links to Profile, Orders, Wishlist, and Logout when a user logs in.
- **Profile Page** allows users to view and edit their profile, see order history, manage their wishlist, and access settings like password reset and address management.

This structure covers a full user profile experience with Redux handling the state management for user actions.

##### TOKEN RELATED

Thank you for sharing your backend Postman result, which shows that your backend is successfully setting the `accessToken` and `refreshToken` in cookies upon login. Since both tokens are stored as HTTP-only cookies, you should not need to handle the tokens manually in the frontend, such as saving them to local storage. The backend will automatically send the cookies with every request (due to `withCredentials: true`), making this approach more secure.

Here’s a breakdown of how you can adjust your frontend logic based on your backend's behavior:

### Key Points from Backend Response:

- **Tokens are stored in cookies**: The `accessToken` and `refreshToken` are securely set in HTTP-only cookies, which means the frontend cannot directly access them via JavaScript (but they are automatically included in requests).
- **Upon logout**, these tokens are cleared, ensuring that the user is properly logged out.
- **HTTP-only cookies**: Since cookies are marked `HttpOnly`, they cannot be read or manipulated from the frontend, enhancing security.

### Frontend Adjustments:

Given the use of HTTP-only cookies, the token management on the frontend can be simplified. You don’t need to save the tokens in local storage. Instead, the focus will be on ensuring requests are made with credentials (`withCredentials: true`) and that the authentication flow handles login and logout correctly.

### Steps to Adjust the Frontend:

1. **Modify `authSlice.jsx` to stop handling tokens manually**:
   Since your tokens are being stored in cookies, you don’t need to handle them explicitly in the Redux state or local storage.

   Update your `loginUser` function as follows:

   ```js
   export const loginUser = createAsyncThunk(
     'auth/loginUser',
     async ({ email, password }, { rejectWithValue }) => {
       try {
         const response = await axios.post(
           'http://localhost:3001/api/auth/login',
           {
             email,
             password,
           },
           { withCredentials: true } // Ensure cookies are sent
         );

         // No need to manually handle token, just return user data
         return response.data.payload;
       } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
       }
     }
   );
   ```

   In the `extraReducers`, update as follows:

   ```js
   .addCase(loginUser.fulfilled, (state, action) => {
     state.status = 'succeeded';
     state.user = action.payload.user; // Store user info in state
     state.token = null; // No need to store token in state
   })
   ```

   You can remove any logic related to `localStorage` or token storage in the state, as cookies will handle token persistence automatically.

2. **Update API requests to include credentials**:
   For any API requests made after login (e.g., fetching the user's profile), you need to include `withCredentials: true` to ensure cookies (tokens) are sent along with the request.

   For example, in `fetchUserProfile` in `userSlice.jsx`, ensure the request is sent with credentials:

   ```js
   export const fetchUserProfile = createAsyncThunk(
     'user/fetchUserProfile',
     async (_, { rejectWithValue }) => {
       try {
         const response = await axios.get(
           'http://localhost:3001/api/users/profile',
           {
             withCredentials: true, // Ensure cookies are sent
           }
         );
         return response.data;
       } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
       }
     }
   );
   ```

3. **Ensure Cookies are Cleared on Logout**:
   The backend already handles clearing the cookies upon logout. The frontend only needs to make the logout request, and the backend will take care of invalidating the session by removing the cookies.

   Here’s how the `logoutUser` action should look:

   ```js
   export const logoutUser = createAsyncThunk(
     'auth/logoutUser',
     async (_, { rejectWithValue }) => {
       try {
         const response = await axios.post(
           'http://localhost:3001/api/auth/logout',
           {}, // No body is required
           { withCredentials: true } // Ensure cookies are sent and cleared
         );
         return response.data;
       } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
       }
     }
   );
   ```

   In the `extraReducers`, when the logout is successful, just clear the user state (no need to handle tokens):

   ```js
   .addCase(logoutUser.fulfilled, (state) => {
     state.status = 'succeeded';
     state.user = null; // Clear user info
   })
   ```

4. **Handle Protected Routes in the Frontend**:
   When accessing protected routes (like the profile page), just ensure that the requests include `withCredentials: true`, as the cookies will be automatically sent with each request.

   For example, your `ProfilePage.jsx` can continue fetching the profile after login like this:

   ```js
   useEffect(() => {
     if (authUser && authUser.id) {
       dispatch(fetchUserProfile());
     }
   }, [dispatch, authUser]);
   ```

   Since the backend verifies tokens from cookies, the frontend doesn’t need to worry about passing the token in the request headers.

### Summary of Changes:

- **Stop storing tokens in local storage or state**. Rely on HTTP-only cookies instead.
- **Ensure requests include `withCredentials: true`** so that cookies (tokens) are sent with every API request.
- **No manual token management** in the frontend is needed, as the backend handles setting and clearing tokens in cookies.

By implementing these changes, your frontend will work securely and efficiently with your backend, leveraging HTTP-only cookies for token management.

<!-- note -->

now you have all the controller and router and slice. based on this code make more functionl login, logout, profile with image upload option. beacuse i want to share with you another thing. how we want to handle backend and frontend.backend is successfully setting the `accessToken` and `refreshToken` in cookies upon login. Since both tokens are stored as HTTP-only cookies, you should not need to handle the tokens manually in the frontend, such as saving them to local storage. The backend will automatically send the cookies with every request - **Tokens are stored in cookies**: The `accessToken` and `refreshToken` are securely set in HTTP-only cookies, which means the frontend cannot directly access them via JavaScript (but they are automatically included in requests).

- **Upon logout**, these tokens are cleared, ensuring that the user is properly logged out.
- **HTTP-only cookies**: Since cookies are marked `HttpOnly`, they cannot be read or manipulated from the frontend, enhancing security.### Frontend Adjustments:

Given the use of HTTP-only cookies, the token management on the frontend can be simplified. You don’t need to save the tokens in local storage. Instead, the focus will be on ensuring requests are made with credentials (`withCredentials: true`) and that the authentication flow handles login and logout correctly. i think this information will help you to setup all the steps update and impliment without error and more organize way.

#### ORDER

/src
App/store.jsx
/components
/Navbar - Navbar.jsx
/Home - Home.jsx
/ContactUs - ContactUs.jsx
/Profile - Profile.jsx
/Dashboard - Dashboard.jsx
/Register - Register.jsx
/Login - Login.jsx
/Cart - Cart.jsx
/Footer - Footer.jsx
/assets
/images - default-avatar.png (placeholder for profile image)
/features/user/userSlice.js
/features/auth/authSlice.js (auth is for login,logout)
/features/cart/cartSlice.js
/features/product/product.js
/features/snackbar/GlobalSnackbar.jsx, snackbarSlice.jsx
/pages - HomePage.jsx - ProfilePage.jsx - DashboardPage.jsx
/App.js
/main.js

For an eCommerce website, it's important to prioritize user experience, usability, and scalability. Below are some best practices and recommendations for designing the structure and components for your eCommerce website, along with how you can organize the navigation and user interactions:

### 1. **Navbar Design**:

The Navbar is one of the most important parts of the eCommerce site, and here are some design elements you should include:

- **Responsive Design**: Ensure that the Navbar collapses into a hamburger menu on mobile devices for a clean and easy-to-navigate layout.
- **Dropdowns for Categories**: Use dropdowns to display product categories or collections, and make it easy to explore subcategories.
- **Quick Access Links**: Include links to key sections like _Home, Shop, Contact Us, Profile, Cart,_ and _Login/Register_.
- **Profile Dropdown with Image**: Once the user logs in, a dropdown should appear with their profile image, which can have links to _Profile, Orders, Wishlist_, and _Logout_.

### 2. **Profile Component**:

- **Profile Image**: Let users upload and display a profile picture, which will appear on the Navbar and Profile page.
- **User Information**: Show detailed user information such as name, email, and contact number, along with the ability to edit it.
- **Order History**: Add a section for viewing previous orders and their statuses.
- **Wishlist**: Let users save products they like for future purchases.
- **Profile Settings**: Include options for password reset, address management, and other settings.

### 3. **Dashboard Component**:

For logged-in users, the dashboard can be a central hub. It should have:

- **Order Summary**: A section for recent orders with tracking info and quick actions (e.g., reordering).
- **Account Info**: Editable sections for account details.
- **Wishlist**: A list of favorited products.
- **Address Book**: Allow users to manage their shipping/billing addresses.

### 4. **Home Component**:

- **Hero Section**: Use a large, visually striking hero section with a prominent CTA like "Shop Now."
- **Featured Products**: Include sections for new arrivals, trending products, and best sellers.
- **Offers/Banners**: Display current deals or promotions.
- **Search Bar**: Implement a search bar with autosuggestions for quick product searches.

### 5. **Contact Us**:

- **Contact Form**: A simple form for users to submit inquiries.
- **Live Chat**: Include a live chat option for real-time support.
- **Support Information**: Add phone numbers, emails, and office addresses for easy contact.

### 6. **Register/Login**:

- **Social Logins**: Let users log in via Google, Facebook, or Apple to simplify the process.
- **Validation**: Provide real-time validation for forms with clear error messages.
- **Login/Register on the Navbar**: Make login/register links prominent on the Navbar for easy access.

### 7. **Profile Image Handling**:

- **Profile Picture Upload**: Include the ability to upload and update a profile image. Use services like Gravatar or integrate with cloud storage solutions to store user profile pictures.
- **Avatar Placeholder**: If the user doesn't have a profile image, show a default avatar icon.

### 8. **Footer Design**:

- **Important Links**: Include links to _About Us, Contact Us, Privacy Policy, Terms of Service, Shipping Information, and Returns_.
- **Social Media Icons**: Display icons that link to the store's social media profiles.
- **Newsletter Subscription**: Provide a simple form for users to subscribe to your newsletter. we want to make Frontend with React js, Material UI,redux-thunk,toolkit,styled,icons-material,material,react-dropzone,react-hook-form,react-redux,react-router-dom, make more organize and beautiful color and style and design with best practic.
  ################################################################

Access token not found. Please login.GET /api/users/profile 401 1.581 ms - 67, here i want to share with you one information. backend i use cookie httpOnly. helper/cookie.js:const setAccessTokenCookie = (res, accessToken) => {
res.cookie('accessToken', accessToken, {
maxAge: 15 _ 60 _ 1000, // 15 minutes
httpOnly: true,
// secure: true,
sameSite: 'none',
});
};

const setRefreshTokenCookie = (res, refreshToken) => {
res.cookie('refreshToken', refreshToken, {
maxAge: 7 _ 24 _ 60 _ 60 _ 1000, // 7 days
httpOnly: true,
// secure: true,
sameSite: 'none',
});
};

module.exports = { setAccessTokenCookie, setRefreshTokenCookie }; so when user will login in AccessToken, RefreshToken will be available and when logout token will not available .everything we will control from server. so we did not use local storage frontend. but problem is log out is not visible also when i login i see Access token not found. login is working but Access token not found. i think you can understand what i explain you. so what is the solution and how ? also i want to share with you userController.to handle user profile from frontend in the backend i use http://localhost:3001/api/users/profile for get and update user. i did not use http://localhost:3001/api/users/:id. i use /profile. i think your concept is now clear. please find a good solution.

###############################
logout
Based on your request, it seems that you want to display the Logout button when a user is logged in, and display the Login button when the user is logged out. Since you're using HTTP-only cookies for authentication and not localStorage, this information is stored server-side, and Redux is managing the user state.

Here's an updated and optimized approach to implement this behavior, focusing on the authSlice, Navbar, and ensuring logout works correctly.

Steps to implement:
Redux State Management: The authSlice should manage the authentication state, ensuring the user is set upon login and cleared upon logout.
Navbar Conditional Rendering: Based on the user state, the Navbar will show either the Logout button (when logged in) or the Login button (when logged out).
Handling HTTP-only cookies: Ensure the user data is fetched when available through HTTP-only cookies.

############
i want to share with you Cookies:accessToken eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtb2hpYnVyX3JhaG1hbjA5QHlhaG9vLmZyIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzI4ODUxNjg3LCJleHAiOjE3Mjg4NTI1ODd9.frzXI4X-se8-9oByiSn_MZAzeWQo_RTGIl1qDnrXAjM localhost / 2024-10-13T20:49:47.568Z 216 ✓ ✓ None Medium
refreshToken eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtb2hpYnVyX3JhaG1hbjA5QHlhaG9vLmZyIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzI4ODUxNjg3LCJleHAiOjE3Mjk0NTY0ODd9.Nmwx50VKo8gG2h_R6vfhcD-DjczMZXCZSIdE-TKpJNU localhost / 2024-10-20T20:34:47.568Z 217 ✓ ✓ None Medium, this is your remember that we use accessToken and refreshToken and we will handle for backend bacause we use cookie HTTP only.

##### LOGIN

Expected Behavior:
When logged in: The navbar will display the user's avatar, and a dropdown menu will show "Profile" and "Logout".
When logged out: The navbar will display "Login" and "Register" buttons.

###### Profile

here i want to render fetchUserProfile and updateUserProfile in the profilePage component. after login when user will navigate to profile, user can visit their information and also there will then can update also their information if they want. here i want to share with you controller and userSlice for your implimentation.

##### render

Yes, I understand the issue more clearly now. The problem you're facing seems to stem from the fact that although you're successfully logging in and receiving accessToken and refreshToken, the user profile isn't being populated or rendered when navigating to the profile page. You're using a ProtectedRoute component, and the status is checked, but the profile data isn't rendering.

The Likely Cause:
The issue is that even though you successfully log in, the ProtectedRoute is dependent on the user state from Redux, and it seems that either:

The user data isn't being set properly in the auth slice after login.
The fetchUserProfile thunk isn't resolving properly, or the user data is not being dispatched/stored correctly after fetching.
The ProtectedRoute is rendering before the user profile is completely fetched.
Let's work through these possible causes and steps to resolve them.

##

registerUser,
activateUser,
fetchAllUsers,
fetchUserProfile,
updateUserProfile,
deleteUser,
forgotPassword,
resetPassword,
updatePassword,
refreshAccessToken,

####

here is existing code.ProfilePage:import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
fetchUserProfile,
updateUserProfile,
} from '../../features/user/userSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
const dispatch = useDispatch();
const navigate = useNavigate();
const {
user,
status: userStatus,
error: userError,
} = useSelector((state) => state.user);

const [profileData, setProfileData] = useState({
firstName: '',
lastName: '',
email: '',
phone: '',
address: '',
image: null,
});
const [isUpdating, setIsUpdating] = useState(false);
const [imagePreview, setImagePreview] = useState(null);

// Fetch user profile if not already loaded
useEffect(() => {
if (userStatus === 'idle') {
dispatch(fetchUserProfile())
.unwrap()
.then((response) => {
console.log('User profile fetched successfully:', response);
})
.catch((error) => {
console.log('Error fetching user profile:', error);
});
}
}, [userStatus, dispatch]);

// Populate profile data when user is loaded
useEffect(() => {
if (user) {
setProfileData({
firstName: user.firstName || '',
lastName: user.lastName || '',
email: user.email || '',
phone: user.phone || '',
address: user.address || '',
image: null,
});
console.log('User profile loaded:', user);
}
}, [user]);

// Handle form input changes
const handleChange = (e) => {
const { name, value, files } = e.target;
if (name === 'image') {
const file = files[0];
if (file && file.size > 2 _ 1024 _ 1024) {
dispatch(
showSnackbar({
message: 'File size exceeds 2 MB!',
severity: 'error',
})
);
return;
}
setProfileData((prevState) => ({ ...prevState, image: file }));
setImagePreview(URL.createObjectURL(file));
} else {
setProfileData((prevState) => ({ ...prevState, [name]: value }));
}
};

// Handle form submission
const handleSubmit = async (e) => {
e.preventDefault();
setIsUpdating(true);

    const formData = new FormData();
    formData.append('firstName', profileData.firstName);
    formData.append('lastName', profileData.lastName);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);
    formData.append('address', profileData.address);
    if (profileData.image) {
      formData.append('image', profileData.image);
    }

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Profile updated successfully!',
          severity: 'success',
        })
      );
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.message || 'Failed to update profile',
          severity: 'error',
        })
      );
    } finally {
      setIsUpdating(false);
    }

};

// If the user is not loaded and no longer in loading state, navigate to login
useEffect(() => {
if (userStatus === 'failed') {
console.log('Failed to fetch user profile:', userError); // Log errors
navigate('/login'); // Redirect to login if profile fails to load
}
}, [userStatus, userError, navigate]);

// UI handling based on userStatus
if (userStatus === 'loading') {
return <CircularProgress />;
}

if (userStatus === 'failed') {
return <p style={{ color: 'red' }}>Error loading profile: {userError}</p>;
}

return (

<div style={{ maxWidth: '600px', margin: '0 auto' }}>
<h1>Profile Page</h1>
{user && (
<form onSubmit={handleSubmit}>
<div>
<label>First Name:</label>
<input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
            />
</div>
<div>
<label>Last Name:</label>
<input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
            />
</div>
<div>
<label>Email:</label>
<input
              type="email"
              name="email"
              value={profileData.email}
              disabled
              onChange={handleChange}
            />
</div>
<div>
<label>Phone:</label>
<input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
            />
</div>
<div>
<label>Address:</label>
<input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleChange}
            />
</div>
<div>
<label>Profile Image:</label>
<input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
{imagePreview && (
<img
src={imagePreview}
alt="Profile Preview"
style={{ width: '100px', height: '100px', marginTop: '10px' }}
/>
)}
</div>
<button type="submit" disabled={isUpdating}>
{isUpdating ? 'Updating...' : 'Update Profile'}
</button>
</form>
)}
</div>
);
};

export default ProfilePage; authSlice:// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchUserProfile } from '../user/userSlice';

// Async login action
export const loginUser = createAsyncThunk(
'auth/loginUser',
async (credentials, { dispatch, rejectWithValue }) => {
try {
const response = await axios.post(
'http://localhost:3001/api/auth/login',
credentials,
{
withCredentials: true, // Send cookies with request
}
);
// Fetch user profile after successful login
dispatch(fetchUserProfile());
return response.data; // Adjust as necessary
} catch (error) {
return rejectWithValue(error.response.data);
}
}
);

// Async logout action using httpOnly cookies
export const logoutUser = createAsyncThunk(
'auth/logoutUser',
async (\_, { rejectWithValue }) => {
try {
await axios.post(
'http://localhost:3001/api/auth/logout',
{},
{
withCredentials: true, // Ensures cookies are sent and cleared
}
);
} catch (error) {
return rejectWithValue(error.response.data);
}
}
);

const authSlice = createSlice({
name: 'auth',
initialState: { user: null, status: 'idle', error: null },
reducers: {},
extraReducers: (builder) => {
builder
// Login User
.addCase(loginUser.pending, (state) => {
state.status = 'loading';
})

      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user; // Check that the user is actually being set here

        // Log the user data for debugging
        console.log('User data after login:', action.payload.user);
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message; // Set error message
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null; // Clear user info on logout
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });

},
});

export default authSlice.reducer;

userSlice://! Fetch user profile
// Example for fetchUserProfile action
export const fetchUserProfile = createAsyncThunk(
'user/fetchUserProfile',
async (\_, { rejectWithValue }) => {
try {
const response = await axios.get(
'http://localhost:3001/api/users/profile',
{
withCredentials: true, // Ensures cookies are sent with request
}
);
console.log('Fetched user profile:', response.data); // Log the fetched data
return response.data; // Make sure this returns the actual user data
} catch (error) {
console.log('Error fetching user profile:', error); // Log any error
return rejectWithValue(
error.response?.data || 'Failed to fetch user profile'
);
}
}
);

//! Update user profile
export const updateUserProfile = createAsyncThunk(
'user/updateUserProfile',
async (formData, { rejectWithValue }) => {
try {
const response = await axios.put(
'http://localhost:3001/api/users/profile',
formData,
{ withCredentials: true }
);
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
); // Slice definition
const userSlice = createSlice({
name: 'user',
initialState: {
user: null,
status: 'idle',
error: null,
},
reducers: {}, //! Fetch user profile
.addCase(fetchUserProfile.pending, (state) => {
state.status = 'loading';
})
.addCase(fetchUserProfile.fulfilled, (state, action) => {
state.user = action.payload;
state.status = 'succeeded';
})
.addCase(fetchUserProfile.rejected, (state, action) => {
state.status = 'failed';
state.error = action.payload;
})

      //! Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update profile';
      }) import { useSelector } from 'react-redux';

import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';

const ProtectedRoute = ({ children }) => {
const { user, status } = useSelector((state) => state.user); // user state not auth

// Show loading spinner while fetching user profile
if (status === 'loading' || status === 'idle') {
return <CircularProgress />;
}

// Handle potential error if status indicates failure
if (status === 'failed') {
return <p>Failed to load user profile. Please try again.</p>;
}

// Check if user is authenticated
return status === 'succeeded' && user ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
children: PropTypes.node.isRequired,
};

export default ProtectedRoute; problem is after login when navigate to profile. page is CircularProgress loading. nothing is display.

#################################################
fine. create a very dynamic Navbar based on our backend and as we discuss and your sugestion. Navbar should be fixed and responsive and for mobile , tablet and desktop. for all devices should be support. when mobile mood it should be open on the left side.we will use toggleDrawer,and src={user?.profileImageUrl || '/assets/images/default-avatar.png'} if user register without image we will set a default image in the user profile. also we want to display user name when user will logged in.like this : <MenuItem>
{user.firstName && user.lastName
? `${user.firstName} ${user.lastName}`
: 'Unknown User'}

</MenuItem> const toggleDrawer = (open) => (event) => {
if (
event.type === 'keydown' &&
(event.key === 'Tab' || event.key === 'Shift')
) {
return;
}
setDrawerOpen(open);
}; so here i share with you some example. i think you can understand. and another option should be add. when user will login logout button will be visible. and when logout only login button will be visible. i think you can understand.

###########################
auto Logout
To stop the user from automatically logging out after a page refresh, you can implement session persistence by checking for an active session (based on cookies, particularly HTTP-only cookies) and refreshing the user's authentication state on page load. Since HTTP-only cookies cannot be accessed by JavaScript, we rely on server-side mechanisms to keep the session alive and refresh tokens as needed.

Here's how we can update the existing code to persist user login status and prevent auto logout on page refresh.

1. Key Updates Overview
   Fetch the user profile or refresh the access token on page load using useEffect when the component mounts.
   Use withCredentials: true in all API requests to ensure cookies (including the HTTP-only session cookies) are sent with the request.
   Make sure the backend is managing token expiration and session cookies.
   Ensure that your refreshAccessToken mechanism works reliably and renews the session in case of token expiration.
   Update your Redux slice and components to reflect changes.
   #########################
   Thank you for sharing the backend code. The provided `authController` and `cookie.js` helper functions manage the authentication flow using JWT tokens and cookies. To prevent automatic logout and implement token refresh in the frontend, we need to integrate your backend’s logic with Axios interceptors to ensure tokens are refreshed automatically when access tokens expire.

### Backend Overview:

1. **Login**:
   - The user logs in, and the backend generates `accessToken` and `refreshToken` using JWT. These tokens are sent to the client via `httpOnly` cookies.
   - `accessToken` expires after 15 minutes, while `refreshToken` expires after 7 days.
2. **Logout**:

   - The backend clears the cookies and revokes the `refreshToken` by adding it to a revoked tokens list.

3. **Token Refresh**:

   - If an `accessToken` expires, the client sends the `refreshToken` to the backend to generate a new `accessToken`.

4. **Protected Route**:
   - For accessing protected routes, the backend checks the validity of the `accessToken`. If it is close to expiration (within 5 minutes), a new `accessToken` is issued.

---

### Frontend Configuration with Axios Interceptors

You mentioned the current issue with auto-logout due to token expiration. The goal is to configure the Axios interceptor to automatically attempt to refresh the `accessToken` when a request fails due to token expiration (`401 Unauthorized` error).

#### Steps for Frontend Configuration:

1. **Set Up Axios Interceptor**:
   Add an interceptor in Axios to handle cases where the `accessToken` expires. When a `401` status is received, it triggers the interceptor to send the `refreshToken` (stored in cookies) to get a new `accessToken` from the backend.

2. **Modify the API URLs**:
   Adjust the Axios interceptor and ensure the correct URL for the refresh token route (`/api/auth/refresh-token`) is being used.

### Example Axios Configuration

Here is a step-by-step implementation for Axios to handle automatic token refresh and retry the failed request:

```js
import axios from 'axios';

// Set up base URL for API requests
const API_BASE_URL = 'http://localhost:3001/api';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Add a request interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error response status is 401 (Unauthorized) and it's not a retry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      try {
        // Attempt to refresh the access token using the refresh token (which is in cookies)
        const { data } = await axiosInstance.post('/auth/refresh-token');

        // Store the new access token in cookies (handled by backend)
        // Update Axios instance headers with the new access token
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${data.payload.accessToken}`;
        originalRequest.headers[
          'Authorization'
        ] = `Bearer ${data.payload.accessToken}`;

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refreshing the token fails, redirect to login or handle logout
        console.error('Token refresh failed. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Explanation:

1. **Axios Instance**:
   - This instance is configured to handle API requests and responses. The `withCredentials: true` option ensures cookies are sent along with each request.
2. **Interceptors**:
   - The response interceptor checks for `401` status errors, indicating the `accessToken` has expired. When this happens, it sends a request to `/auth/refresh-token` (from the backend) to get a new token.
   - Once a new `accessToken` is received, it's stored, and the original request is retried with the updated token.
3. **Retry Logic**:

   - After a successful token refresh, the original request that failed due to expiration is automatically retried with the new token.

4. **Error Handling**:
   - If the refresh token fails or is invalid, the user is redirected to the login page.

---

### Integration into Your React Components

Now that the Axios instance is configured to handle token refresh automatically, you can replace your existing Axios calls in React components with this new instance. Here’s an example of how to use this in a component:

```js
import axiosInstance from './axiosInstance'; // Import your configured Axios instance

const fetchProtectedData = async () => {
  try {
    const response = await axiosInstance.get('/protected-route');
    console.log('Protected data:', response.data);
  } catch (error) {
    console.error('Error fetching protected data:', error);
  }
};
```

### Backend Improvements (Optional):

- **Handle Revoked Refresh Tokens**:
  The backend should store revoked tokens in a persistent store (like a database or cache) rather than in memory (e.g., `revokedTokens` array). Using an in-memory array will not work well in production when the app scales.
- **Token Expiration Check**:
  When verifying the access token in `handleProtectedRoute`, you’re checking for expiration within 5 minutes. This is a good approach to issue new tokens automatically. Make sure the frontend doesn’t need to manually refresh the token during active sessions.

---

### Conclusion:

With this setup, your application will automatically refresh tokens when necessary, preventing users from being logged out due to token expiration during active sessions. This configuration ensures a seamless user experience without needing manual refresh logic on the frontend.

//! login request
// const loginUser = async (email, password) => {
// try {
// const response = await axiosInstance.post(`${API_BASE_URL}/login`, {
// email,
// password,
// });

// // Store the access token in localStorage (optional if stored in cookies)
// localStorage.setItem('accessToken', response.data.payload.accessToken);

// console.log('User logged in successfully:', response.data.payload.user);
// } catch (error) {
// console.error('Error logging in:', error);
// }
// };

// Example of accessing a protected route
// const getProtectedData = async () => {
// try {
// const response = await axiosInstance.post(`${API_BASE_URL}/protected`);
// console.log('Protected data:', response.data.payload);
// } catch (error) {
// console.error('Error accessing protected route:', error);
// }
// };

//! getProtectedData
// export const getProtectedData = createAsyncThunk(
// 'user/getProtectedData',
// async (\_, { rejectWithValue }) => {
// try {
// const response = await axiosInstance.post(`${API_BASE_URL}/protected`);
// return response.data;
// } catch (error) {
// return rejectWithValue(
// error.response?.data || 'Failed to access protected data'
// );
// }
// }
// );

<!-- test -->

now after login output is :Profile state: null
userSlice.jsx:205

       POST http://localhost:3001/api/auth/refresh-token 401 (Unauthorized)

dispatchXhrRequest @ axios.js?v=180e2de3:1680
xhr @ axios.js?v=180e2de3:1560
dispatchRequest @ axios.js?v=180e2de3:2035
\_request @ axios.js?v=180e2de3:2240
request @ axios.js?v=180e2de3:2141
httpMethod @ axios.js?v=180e2de3:2269
wrap @ axios.js?v=180e2de3:8
(anonymous) @ userSlice.jsx:205
(anonymous) @ @reduxjs_toolkit.js?v=180e2de3:1989
(anonymous) @ @reduxjs_toolkit.js?v=180e2de3:2023
(anonymous) @ @reduxjs_toolkit.js?v=180e2de3:1116
(anonymous) @ @reduxjs_toolkit.js?v=180e2de3:1392
(anonymous) @ @reduxjs_toolkit.js?v=180e2de3:1207
dispatch @ page.bundle.js:6
(anonymous) @ Navbar.jsx:70
commitHookEffectListMount @ chunk-3IHV7RO6.js?v=180e2de3:16915
commitPassiveMountOnFiber @ chunk-3IHV7RO6.js?v=180e2de3:18156
commitPassiveMountEffects_complete @ chunk-3IHV7RO6.js?v=180e2de3:18129
commitPassiveMountEffects_begin @ chunk-3IHV7RO6.js?v=180e2de3:18119
commitPassiveMountEffects @ chunk-3IHV7RO6.js?v=180e2de3:18109
flushPassiveEffectsImpl @ chunk-3IHV7RO6.js?v=180e2de3:19490
flushPassiveEffects @ chunk-3IHV7RO6.js?v=180e2de3:19447
commitRootImpl @ chunk-3IHV7RO6.js?v=180e2de3:19416
commitRoot @ chunk-3IHV7RO6.js?v=180e2de3:19277
performSyncWorkOnRoot @ chunk-3IHV7RO6.js?v=180e2de3:18895
flushSyncCallbacks @ chunk-3IHV7RO6.js?v=180e2de3:9119
commitRootImpl @ chunk-3IHV7RO6.js?v=180e2de3:19432
commitRoot @ chunk-3IHV7RO6.js?v=180e2de3:19277
finishConcurrentRender @ chunk-3IHV7RO6.js?v=180e2de3:18805
performConcurrentWorkOnRoot @ chunk-3IHV7RO6.js?v=180e2de3:18718
workLoop @ chunk-3IHV7RO6.js?v=180e2de3:197
flushWork @ chunk-3IHV7RO6.js?v=180e2de3:176
performWorkUntilDeadline @ chunk-3IHV7RO6.js?v=180e2de3:384
Show 30 more frames
Show lessUnderstand this errorAI
Navbar.jsx:82 Profile state: null
Navbar.jsx:76 Failed to refresh token {success: false, message: 'No refresh token provided. Please log in again.'}
overrideMethod @ hook.js:608
(anonymous) @ Navbar.jsx:76
Promise.catch
(anonymous) @ Navbar.jsx:75
commitHookEffectListMount @ chunk-3IHV7RO6.js?v=180e2de3:16915
commitPassiveMountOnFiber @ chunk-3IHV7RO6.js?v=180e2de3:18156
commitPassiveMountEffects_complete @ chunk-3IHV7RO6.js?v=180e2de3:18129
commitPassiveMountEffects_begin @ chunk-3IHV7RO6.js?v=180e2de3:18119
commitPassiveMountEffects @ chunk-3IHV7RO6.js?v=180e2de3:18109
flushPassiveEffectsImpl @ chunk-3IHV7RO6.js?v=180e2de3:19490
flushPassiveEffects @ chunk-3IHV7RO6.js?v=180e2de3:19447
commitRootImpl @ chunk-3IHV7RO6.js?v=180e2de3:19416
commitRoot @ chunk-3IHV7RO6.js?v=180e2de3:19277
performSyncWorkOnRoot @ chunk-3IHV7RO6.js?v=180e2de3:18895
flushSyncCallbacks @ chunk-3IHV7RO6.js?v=180e2de3:9119
commitRootImpl @ chunk-3IHV7RO6.js?v=180e2de3:19432
commitRoot @ chunk-3IHV7RO6.js?v=180e2de3:19277
finishConcurrentRender @ chunk-3IHV7RO6.js?v=180e2de3:18805
performConcurrentWorkOnRoot @ chunk-3IHV7RO6.js?v=180e2de3:18718
workLoop @ chunk-3IHV7RO6.js?v=180e2de3:197
flushWork @ chunk-3IHV7RO6.js?v=180e2de3:176
performWorkUntilDeadline @ chunk-3IHV7RO6.js?v=180e2de3:384
Show 19 more frames
Show lessUnderstand this errorAI
Navbar.jsx:82 Profile state: null
Navbar.jsx:82 Profile state: null
Navbar.jsx:82 Profile state: {success: true, message: 'User profile retrieved successfully', payload: {…}} now navbar populate userName and user image smothly. also auto logout is stop after refresh the page. without usage axiosInstance. so features/user/axiosInstance.js:import axios from 'axios';

// Set up base URL for API requests
const API_BASE_URL = 'http://localhost:3001/api'; // Update to your backend URL

// Create an Axios instance
const axiosInstance = axios.create({
baseURL: API_BASE_URL,
withCredentials: true, // Important for cookies
});

// Add a request interceptor to include the access token in requests
axiosInstance.interceptors.request.use(
(config) => {
const token = localStorage.getItem('accessToken');
if (token) {
config.headers['Authorization'] = `Bearer ${token}`; // Attach token to every request
}
return config;
},
(error) => {
return Promise.reject(error);
}
);

// Add a response interceptor to handle token refreshing
axiosInstance.interceptors.response.use(
(response) => response, // If the request is successful, just return the response
async (error) => {
const originalRequest = error.config;

    // If the error response status is 401 (Unauthorized) and it's not a retry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      try {
        // Attempt to refresh the access token using the refresh token (which is in cookies)
        const { data } = await axiosInstance.post('/auth/refresh-token');

        // Store the new access token in localStorage (or cookies)
        localStorage.setItem('accessToken', data.payload.accessToken);

        // Update Axios instance headers with the new access token
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${data.payload.accessToken}`;
        originalRequest.headers[
          'Authorization'
        ] = `Bearer ${data.payload.accessToken}`;

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refreshing the token fails, redirect to login or handle logout
        console.error('Token refresh failed. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);

}
);

export default axiosInstance;
like this i setup. but i dont know how we will impliment in the userSlice. here i share our userSlice:import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3001/api/auth';
const USER_API_BASE_URL = 'http://localhost:3001/api/users';

// Helper function for handling rejected actions
const handleRejected = (state, action) => {
state.status = 'failed';
state.error = action.payload || 'An error occurred';
};

//! Login User
export const loginUser = createAsyncThunk(
'user/loginUser',
async (userData, { rejectWithValue }) => {
try {
// Send login request to the backend with user credentials
const response = await axios.post(`${API_BASE_URL}/login`, userData, {
withCredentials: true, // to include cookies if used
});

      // Extract tokens (assuming the backend sends accessToken and refreshToken)
      const { token: accessToken, refreshToken } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken); // Save refreshToken if available
      }

      return response.data; // Return user data or token to Redux
    } catch (error) {
      // Handle login failure, reject the thunk
      return rejectWithValue(error.response?.data || 'Login failed');
    }

}
);

//! Logout User (asyncThunk)
export const logoutUser = createAsyncThunk(
'user/logoutUser',
async (\_, { rejectWithValue }) => {
try {
await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! getProtectedData
// export const getProtectedData = createAsyncThunk(
// 'user/getProtectedData',
// async (\_, { rejectWithValue }) => {
// try {
// const response = await axiosInstance.post(`${API_BASE_URL}/protected`);
// return response.data;
// } catch (error) {
// return rejectWithValue(
// error.response?.data || 'Failed to access protected data'
// );
// }
// }
// );

//! Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
'user/fetchUserProfile',
async (\_, { rejectWithValue }) => {
try {
const response = await axios.get(`${USER_API_BASE_URL}/profile`, {
withCredentials: true,
});
return response.data;
} catch (error) {
return rejectWithValue(
error.response?.data || 'Failed to fetch user profile'
);
}
}
);

//! Update user profile
export const updateUserProfile = createAsyncThunk(
'user/updateUserProfile',
async (formData, { rejectWithValue }) => {
try {
const response = await axios.put(
`${USER_API_BASE_URL}/profile`,
formData,
{
withCredentials: true,
}
);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }

}
);

//! Fetch all users
export const fetchAllUsers = createAsyncThunk(
'user/fetchUsers',
async (\_, { rejectWithValue }) => {
try {
const response = await axios.get(USER_API_BASE_URL);
return response.data;
} catch (error) {
return rejectWithValue(error.response.data);
}
}
);
//! Fetch user by Id
export const fetchUserById = createAsyncThunk(
'user/fetchUserById',
async (id, { rejectWithValue }) => {
try {
const response = await axios.get(`${USER_API_BASE_URL}/${id}`);
return response.data;
} catch (error) {
return rejectWithValue(error.response.data);
}
}
);

//! Update user by Id

//! Delete User
export const deleteUser = createAsyncThunk(
'user/deleteUser',
async (id, { rejectWithValue }) => {
try {
const response = await axios.delete(`${USER_API_BASE_URL}/${id}`);
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! Forgot Password
export const forgotPassword = createAsyncThunk(
'user/forgotPassword',
async (email, { rejectWithValue }) => {
try {
const response = await axios.post(
`${USER_API_BASE_URL}/forgot-password`,
{
email,
}
);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }

}
);

//! Reset Password
export const resetPassword = createAsyncThunk(
'user/resetPassword',
async ({ token, password }, { rejectWithValue }) => {
try {
const response = await axios.put(`${USER_API_BASE_URL}/reset-password`, {
token,
password,
});
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! Update Password
export const updatePassword = createAsyncThunk(
'user/updatePassword',
async ({ oldPassword, newPassword }, { rejectWithValue }) => {
try {
const response = await axios.put(
`${USER_API_BASE_URL}/update-password`,
{ oldPassword, newPassword },
{
withCredentials: true, // Ensure cookies are sent
}
);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }

}
);

//! Refresh Access Token
export const refreshAccessToken = createAsyncThunk(
'user/refreshAccessToken',
async (\_, { rejectWithValue }) => {
try {
const response = await axios.post(
`${API_BASE_URL}/refresh-token`,
{},
{ withCredentials: true }
);
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! Register User
export const registerUser = createAsyncThunk(
'user/registerUser',
async (userData, { rejectWithValue }) => {
try {
const response = await axios.post(
`${USER_API_BASE_URL}/process-register`,
userData
);
return response.data;
} catch (error) {
return rejectWithValue(
error.response?.data || { message: 'Something went wrong!' }
);
}
}
);
//! Activate User
export const activateUser = createAsyncThunk(
'user/activateUser',
async ({ token }, { rejectWithValue }) => {
try {
const response = await axios.post(`${USER_API_BASE_URL}/activate`, {
token,
});
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

// Slice definition
const userSlice = createSlice({
name: 'user',
initialState: {
user: null,
profile: null,
loggedIn: false,
error: null,
status: 'idle',
},
reducers: {
loginUserSuccess(state, action) {
state.user = action.payload.user;
},
// Rename this reducer method to avoid conflict with the asyncThunk
logoutUserReducer(state) {
state.user = null;
state.profile = null;
state.loggedIn = false;
},
},
extraReducers: (builder) => {
builder
// Login User
.addCase(loginUser.fulfilled, (state, action) => {
state.loggedIn = true;
state.user = action.payload;
})
.addCase(loginUser.rejected, handleRejected)

      // Logout User (asyncThunk)
      .addCase(logoutUser.fulfilled, (state) => {
        state.loggedIn = false;
        state.user = null;
        state.profile = null;
      })
      .addCase(logoutUser.rejected, handleRejected)

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loggedIn = true;
      })
      .addCase(fetchUserProfile.rejected, handleRejected)


      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload; // Assuming response returns updated profile data
      })
      .addCase(updateUserProfile.rejected, handleRejected)

      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data; // Assuming response returns { data: [...] }
      })
      .addCase(fetchAllUsers.rejected, handleRejected)

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data; // Assuming response returns { data: {} }
      })
      .addCase(fetchUserById.rejected, handleRejected)

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = state.user.filter(
          (user) => user.id !== action.payload.id // Remove deleted user from users array
        );
      })
      .addCase(deleteUser.rejected, handleRejected)

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.forgotPasswordMessage =
          'Check your email for further instructions.';
      })
      .addCase(forgotPassword.rejected, handleRejected)

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.resetPasswordMessage = 'Password has been reset successfully.';
      })
      .addCase(resetPassword.rejected, handleRejected)

      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.updatePasswordMessage = 'Password updated successfully.';
      })
      .addCase(updatePassword.rejected, handleRejected)

      // Refresh Access Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loggedIn = true;
        state.user = action.payload; // Assuming the token response contains user info
      })
      .addCase(refreshAccessToken.rejected, handleRejected)

      // Register user
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activationMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, handleRejected)

      // Activate user
      .addCase(activateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(activateUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(activateUser.rejected, handleRejected);

},
});

// Export actions, now using the renamed logout reducer
export const { loginUserSuccess, logoutUserReducer } = userSlice.actions;

// Export default reducer
export default userSlice.reducer;

######

navbar:

//! previous

// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
// AppBar,
// Toolbar,
// IconButton,
// Typography,
// Button,
// Drawer,
// Box,
// List,
// ListItem,
// Avatar,
// Menu,
// MenuItem,
// Divider,
// } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import HomeIcon from '@mui/icons-material/Home';
// import LoginIcon from '@mui/icons-material/Login';
// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import ContactMailIcon from '@mui/icons-material/ContactMail';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutUser } from '../features/auth/authSlice'; // Adjust the path to your authSlice file

// const Navbar = () => {
// const dispatch = useDispatch();
// const navigate = useNavigate();
// const { user } = useSelector((state) => state.auth);
// const [drawerOpen, setDrawerOpen] = useState(false);
// const [anchorEl, setAnchorEl] = useState(null);
// const [profileImage, setProfileImage] = useState(null);

// useEffect(() => {
// // Load profile image from localStorage if available
// const storedImage = localStorage.getItem('profileImage');
// if (storedImage) {
// setProfileImage(storedImage);
// } else if (user && user.image) {
// setProfileImage(user.image);
// localStorage.setItem('profileImage', user.image);
// }
// }, [user]);

// const toggleDrawer = (open) => (event) => {
// if (
// event.type === 'keydown' &&
// (event.key === 'Tab' || event.key === 'Shift')
// ) {
// return;
// }
// setDrawerOpen(open);
// };

// const handleMenu = (event) => {
// setAnchorEl(event.currentTarget);
// };

// const handleClose = () => {
// setAnchorEl(null);
// };

// const handleLogout = () => {
// dispatch(logoutUser()).then(() => {
// localStorage.removeItem('profileImage'); // Remove image from localStorage on logout
// setProfileImage(null); // Clear profile image state
// navigate('/login');
// });
// handleClose();
// };

// const handleImageChange = (e) => {
// const file = e.target.files[0];
// if (file) {
// const reader = new FileReader();
// reader.onload = (upload) => {
// setProfileImage(upload.target.result);
// localStorage.setItem('profileImage', upload.target.result); // Save image to localStorage
// };
// reader.readAsDataURL(file);
// }
// };

// const drawerList = () => (
// <Box
// sx={{ width: 250 }}
// role="presentation"
// onClick={toggleDrawer(false)}
// onKeyDown={toggleDrawer(false)}
// >
// <List>
// <ListItem button component={Link} to="/">
// <HomeIcon sx={{ color: '#3f51b5', marginRight: 1 }} />
// <Typography variant="body1">Home</Typography>
// </ListItem>
// <Divider />
// <ListItem button component={Link} to="/dashboard">
// <DashboardIcon sx={{ color: '#673ab7', marginRight: 1 }} />
// <Typography variant="body1">Dashboard</Typography>
// </ListItem>
// <ListItem button component={Link} to="/register">
// <PersonAddIcon sx={{ color: '#ff5722', marginRight: 1 }} />
// <Typography variant="body1">Register</Typography>
// </ListItem>

// <ListItem button component={Link} to="/login">
// <LoginIcon sx={{ color: '#009688', marginRight: 1 }} />
// <Typography variant="body1">Login</Typography>
// </ListItem>

// <ListItem button component={Link} to="/forgot-password">
// <LoginIcon sx={{ color: '#009688', marginRight: 1 }} />
// <Typography variant="body1">ForgotPassword</Typography>
// </ListItem>

// <ListItem button component={Link} to={`/reset-password`}>
// <LoginIcon sx={{ color: '#009688', marginRight: 1 }} />
// <Typography variant="body1">Reset Password</Typography>
// </ListItem>

// <ListItem button component={Link} to={`/update-password`}>
// <LoginIcon sx={{ color: '#009688', marginRight: 1 }} />
// <Typography variant="body1">Update Password</Typography>
// </ListItem>

// <ListItem button component={Link} to="/contact">
// <ContactMailIcon sx={{ color: '#03a9f4', marginRight: 1 }} />
// <Typography variant="body1">Contact Us</Typography>
// </ListItem>
// </List>
// </Box>
// );

// return (
// <AppBar position="static">
// <Toolbar>
// <IconButton
// edge="start"
// color="inherit"
// aria-label="menu"
// onClick={toggleDrawer(true)}
// >
// <MenuIcon />
// </IconButton>
// <Typography variant="h6" sx={{ flexGrow: 1 }}>
// EcommerceApp
// </Typography>
// {user ? (
// <>
// <Typography variant="h6" sx={{ marginRight: 2 }}>
// Welcome, {user.nom}
// </Typography>
// <div>
// <IconButton
// edge="end"
// aria-label="current user's account"
// aria-controls="menu-appbar"
// aria-haspopup="true"
// onClick={handleMenu}
// color="inherit"
// >
// <Avatar
// src={profileImage || '/default-profile.png'}
// alt={user.nom}
// sx={{ width: 30, height: 30 }}
// >
// {user.nom ? user.nom.charAt(0) : 'U'}
// </Avatar>
// </IconButton>
// <Menu
// id="menu-appbar"
// anchorEl={anchorEl}
// anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
// keepMounted
// transformOrigin={{ vertical: 'top', horizontal: 'right' }}
// open={Boolean(anchorEl)}
// onClose={handleClose}
// >
// <MenuItem>
// {user.firstName && user.lastName
// ? `${user.firstName} ${user.lastName}`
// : 'Unknown User'}
// </MenuItem>
// <MenuItem>
// <input
// type="file"
// accept="image/\*"
// onChange={handleImageChange}
// style={{ display: 'none' }}
// id="upload-image"
// />
// <label htmlFor="upload-image" style={{ cursor: 'pointer' }}>
// Change Profile Picture
// </label>
// </MenuItem>
// <MenuItem onClick={handleLogout}>Logout</MenuItem>
// </Menu>
// </div>
// </>
// ) : (
// <Button color="inherit" component={Link} to="/login">
// Login
// </Button>
// )}
// </Toolbar>
// <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
// {drawerList()}
// </Drawer>
// </AppBar>
// );
// };

// export default Navbar;

#### Profile:

now we will work for Profile component. we want to fetch userProfile as like we fetch on the Navbar. means when user will loggedIn, we will fetch user data from redux or backend database from UsersTable. Basicly we use cookie HTTP only. so we did not use local storage or session storage. we use userSlice for handling user from backend to frontend.

### updateUserProfile

in the same way we want to create updateUserProfile also with the same way. in fact when user need to update their profile they can update. for this we need to populate existing user data for update with update option.
and remember that when user will logout userProfile will not be visible anymore and userUpdateProfile also same as userProfile. we want to identify induvisual user for fetch profile and update. for this here i want to share with you existing userSlice, Navbar. so that your concept will be compleatly clear to do our mission.
i think my idea is ok for fetchUserProfile and updateUserProfile.what you think. what is the best practic for this operation. if my plan is not ok you can make the best practic for this operation. lets go

##############

Your current approach for fetching and updating user profiles using the userSlice and Navbar component seems generally solid. To refine it further, I'll address your plan for handling the Profile component and updateUserProfile operation, ensuring it works seamlessly with your state management and the HTTP-only cookies setup.

Here are some key points to improve clarity and execution:

1. Fetching User Profile
   Use of Redux for profile fetching: You are already using fetchUserProfile in your slice, and fetching the user profile based on authentication (which is done via cookies) is a good practice. The backend should verify the session through the access token in the cookies, returning the appropriate user details.
   Best Practice: Use the fetchUserProfile action as early as possible, like in the Navbar or in a root-level component (e.g., App.js), to ensure that the profile data is always available when needed. This reduces the risk of not having profile data available when rendering.
2. Handling Profile Updates
   Prepopulate User Data: When loading the Profile component for updates, prepopulate fields with the existing user data. You can use the useSelector to fetch the profile data from Redux and display it in the form. When the user submits updates, you can dispatch updateUserProfile with the modified data.

Form Handling:

Use a form that is initially populated with the data from profile in the Redux state.
On submit, dispatch updateUserProfile to save the changes.
Optionally, add optimistic UI updates (show the updated data immediately after submission) to improve user experience. 3. Logout Behavior
Clearing Data on Logout: When the user logs out, make sure both profile and user are cleared from Redux to prevent access to stale data. This is already done with your logoutUserReducer, which sets both user and profile to null. You just need to ensure that no restricted components are accessible without login. 4. Access Control
Restricted Access: Components like Profile and UpdateProfile should only be accessible when loggedIn is true. This can be easily achieved by wrapping your routes or components in a condition:

###########################UPDATE###############################
Your approach for implementing user profile fetching and updating seems good, and it adheres to many best practices, such as using Redux for state management and leveraging cookies for token-based authentication. I'll outline the steps and some suggestions to ensure a smooth implementation for `fetchUserProfile` and `updateUserProfile`:

### General Approach:

1. **Fetch User Profile**:

   - When the user logs in, you fetch the profile from the server (using `fetchUserProfile` thunk) and store it in Redux. You can retrieve the profile in components like the Navbar, Profile page, and Update Profile form.

2. **Update User Profile**:
   - You need a form where users can view their current details and update them. On form submission, the updated data is sent to the backend using the `updateUserProfile` thunk, which will also update the Redux store upon success.

### Key Components and Flow:

#### 1. **Navbar**:

The Navbar should display the user's profile data after they log in. You are already fetching the profile data in the Navbar using the `fetchUserProfile` thunk. This will ensure that once the user is logged in, their name and profile image will appear in the Navbar.

#### 2. **Profile Component** (For Viewing):

You will likely want to create a `Profile` component where the user can view their details. Here, you can access the user's profile from the Redux state and display their info (like first name, last name, email, etc.).

```jsx
import React from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { profile } = useSelector((state) => state.user);

  if (!profile) {
    return <div>Loading...</div>; // or redirect if necessary
  }

  return (
    <div>
      <h1>
        {profile.user.firstName} {profile.user.lastName}'s Profile
      </h1>
      <p>Email: {profile.user.email}</p>
      <p>Phone: {profile.user.phone}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default Profile;
```

#### 3. **Update User Profile Component**:

In the Update Profile page, you'll want to pre-fill the form fields with the user's existing data and allow them to make updates. You can fetch the current profile from Redux and use it to populate the form. On form submission, you'll dispatch the `updateUserProfile` thunk.

```jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../features/user/userSlice';

const UpdateUserProfile = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Add other fields you need
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        email: profile.user.email,
        phone: profile.user.phone,
        // Populate more fields from profile
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData)); // Dispatch updateUserProfile thunk
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UpdateUserProfile;
```

### Important Considerations:

1. **Token Handling**: Ensure that you are securely handling your JWT tokens using HTTP-only cookies, as mentioned. You already handle this via the `refreshAccessToken` thunk in the Navbar, which is great.
2. **Redux State Management**:
   - Your `userSlice` is well-structured with `fetchUserProfile` and `updateUserProfile` thunks. Just ensure that `updateUserProfile` updates both the server and the Redux state successfully (you’re already updating the profile state on successful update).
3. **Profile Caching**: If you want to ensure the updated profile is reflected everywhere, confirm that Redux updates are propagating correctly (e.g., profile data in the Navbar is updated after the update). You can ensure this by updating the Redux profile state after a successful update.

### Best Practices:

- **Optimistic Updates**: After updating the profile, immediately update the local Redux state so the UI reflects the changes without waiting for the API response.
- **Error Handling**: Ensure that errors (like failed profile updates) are handled gracefully with user-friendly messages (e.g., via the Snackbar you mentioned).

### Optional Enhancements:

- **Validation**: Add validation to the form (e.g., using a library like `Formik` or `Yup`) to ensure valid input before sending the update request.
- **Image Upload**: If users need to update their profile picture, include a file input and handle the file upload to the server.

Your overall plan looks solid, and with these implementations, you should be able to fetch and update the user's profile smoothly!

#########
fine. but we want to update all the fields without email. firstName,lastName,phone,address,image, email is read only. we cant give the option update email for security reason. we can use this message:message: 'Email updates are not allowed for security reasons', and another thing. can we use validation for updateuserProfile ? if so how ? backend we use this validator:// validators/user.js
const { body } = require('express-validator');

// Registration validation
const validateUserRegistration = [
body('firstName')
.trim()
.notEmpty()
.withMessage('First name is required')
.isAlpha('en-US', { ignore: ' ' })
.withMessage('First name should contain only alphabetic characters'),

body('lastName')
.trim()
.notEmpty()
.withMessage('Last name is required')
.isAlpha('en-US', { ignore: ' ' })
.withMessage('Last name should contain only alphabetic characters'),

body('email')
.trim()
.notEmpty()
.withMessage('Email is required. Enter your email address')
.isEmail()
.withMessage('Invalid email address'),

body('password')
.trim()
.notEmpty()
.withMessage('Password is required. Enter your password')
.isLength({ min: 6 })
.withMessage('Password should be at least 6 characters long')
.matches(
/^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
)
.withMessage(
'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character'
),

body('address')
.trim()
.notEmpty()
.withMessage('Address is required')
.isLength({ min: 3 })
.withMessage('Address should be at least 3 characters long'),

body('phone')
.trim()
.notEmpty()
.withMessage('Phone number is required')
.matches(/^\+?[1-9]\d{1,14}$/)
.withMessage('Phone number must be a valid international format'),

body('image')
.optional()
.isString()
.withMessage('User image should be a string'),
]; so based on this validator we can use frontend validation for real time validator. now make more organize and meaningful and beautiful card as like but more visible.

#########################
here updatePassword component:import { useState } from 'react';
import {
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
TextField,
Box,
InputAdornment,
IconButton,
Card,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from '../../features/user/userSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import showSnackbar action
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../PROFILE/theme';

const UpdatePassword = () => {
const dispatch = useDispatch();
const navigate = useNavigate();
const { id } = useParams();
const { status, error } = useSelector((state) => state.user);

const [oldPassword, setOldPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [oldPasswordError, setOldPasswordError] = useState('');
const [newPasswordError, setNewPasswordError] = useState('');
const [confirmPasswordError, setConfirmPasswordError] = useState('');
const [showOldPassword, setShowOldPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const validateNewPassword = (password) => {
const minLength = 6;
const regex = /^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[@$!%*?&])/;
if (!password) {
return 'New password is required';
}
if (password.length < minLength) {
return `Password should be at least ${minLength} characters long`;
}
if (!regex.test(password)) {
return 'Password should contain one uppercase letter, one lowercase letter, one number, and one special character';
}
return '';
};

const validateConfirmPassword = (password, confirmPassword) => {
if (!confirmPassword) {
return 'Please confirm your new password';
}
if (password !== confirmPassword) {
return 'Passwords do not match';
}
return '';
};

const handleOldPasswordChange = (e) => {
setOldPassword(e.target.value);
};

const handleNewPasswordChange = (e) => {
const value = e.target.value;
setNewPassword(value);
const error = validateNewPassword(value);
setNewPasswordError(error);
};

const handleConfirmPasswordChange = (e) => {
const value = e.target.value;
setConfirmPassword(value);
const error = validateConfirmPassword(newPassword, value);
setConfirmPasswordError(error);
};

const handleSubmit = async (e) => {
e.preventDefault();

    // Validate passwords before dispatching the action
    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    setNewPasswordError(newPasswordError);
    setConfirmPasswordError(confirmPasswordError);

    if (newPasswordError || confirmPasswordError) {
      return;
    }

    const result = await dispatch(
      updatePassword({
        id,
        oldPassword,
        newPassword,
        confirmedPassword: confirmPassword,
      }) // Include confirmedPassword here
    );

    if (result.type === 'user/updatePassword/fulfilled') {
      dispatch(
        showSnackbar({
          message: 'Password updated successfully!',
          severity: 'success',
        })
      );
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      dispatch(
        showSnackbar({
          message: error || 'Something went wrong. Please try again.',
          severity: 'error',
        })
      );
    }

};

const handleCancel = () => {
navigate('/dashboard');
};

const handleClickShowOldPassword = () => setShowOldPassword((prev) => !prev);
const handleClickShowNewPassword = () => setShowNewPassword((prev) => !prev);
const handleClickShowConfirmPassword = () =>
setShowConfirmPassword((prev) => !prev);

return (
<ThemeProvider theme={theme}>
<motion.div
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }} >

<Dialog
open={true}
onClose={() => {}}
maxWidth="xs"
fullWidth
PaperProps={{
            sx: { borderRadius: '20px', padding: 2 },
          }} >
<DialogTitle>
<motion.div
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5 }}
style={{ textAlign: 'center', fontWeight: 'bold' }} >
Update Your Password
</motion.div>
</DialogTitle>

          <DialogContent>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: 3,
                padding: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  textAlign: 'center',
                }}
              >
                {/* Old Password Field */}
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Old Password"
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={handleOldPasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle old password visibility"
                          onClick={handleClickShowOldPassword}
                          edge="end"
                        >
                          {showOldPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: '10px' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />

                {/* New Password Field */}
                <TextField
                  fullWidth
                  variant="outlined"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  error={!!newPasswordError}
                  helperText={newPasswordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={handleClickShowNewPassword}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: '10px' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />

                {/* Confirm Password Field */}
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: '10px' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Card>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCancel}
              color="error"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </ThemeProvider>

);
};

export default UpdatePassword; and router is userRouter.put(
'/update-password/:id',
validateUserPasswordUpdate,
runValidation,
isLoggedIn,
handleUpdatePassword
); controller is://! UpdatePassword
const handleUpdatePassword = async (req, res, next) => {
try {
const { oldPassword, newPassword, confirmedPassword } = req.body; // Use confirmedPassword here
const userId = req.params.id; // Extract the ID from the route params

    // Find user by ID
    const user = await User.findByPk(userId); // Sequelize method
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Compare old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).send({ message: 'Old password is incorrect' });
    }

    // Ensure newPassword and confirmedPassword match
    if (newPassword !== confirmedPassword) {
      return res.status(400).send({ message: 'Passwords do not match' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update and save the new password
    user.password = hashedNewPassword;
    await user.save();

    // Respond with success message
    return res.status(200).send({
      message: 'Your password was updated successfully',
      payload: { userId: user.id },
    });

} catch (error) {
next(error); // Pass error to middleware
}
}; and express validator:// Update password validation
const validateUserPasswordUpdate = [
body('oldPassword')
.trim()
.notEmpty()
.withMessage('Old Password is required. Enter your old password')
.isLength({ min: 6 })
.withMessage('Old Password should be at least 6 characters long')
.matches(
/^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
)
.withMessage(
'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
),

body('newPassword')
.trim()
.notEmpty()
.withMessage('New Password is required. Enter your new password')
.isLength({ min: 6 })
.withMessage('New Password should be at least 6 characters long')
.matches(
/^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
)
.withMessage(
'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
),

body('confirmedPassword') // Ensure this is the same as in the controller
.trim()
.notEmpty()
.withMessage('Please confirm your new password.')
.custom((value, { req }) => {
if (value !== req.body.newPassword) {
throw new Error('Passwords do not match.');
}
return true;
}),
]; runvalidation:// validators/index.js
const { validationResult } = require('express-validator');

const runValidation = (req, res, next) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: 'Validation failed.',
errors: errors.array().map((err) => err.msg),
});
}
next();
};

module.exports = runValidation; please review and update and integrate with all the existing updatePassword code. i have a question. did we update password by id or profile ? like updateUserProfile. we already apply updateUserProiflle when user logged In than we identify the user than we update profile. so for update password we will do this way or we will identify by id ? remember that we did not use local storage. we use only cookie HTTP only. here i can share UpdateUserProfile controller://! Update logged-in user's profile
const handleUpdateUserProfile = async (req, res, next) => {
try {
const userId = req.user.id; // Extracted from JWT
const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    // Prevent sensitive updates (like email)
    if (req.body.email && req.body.email !== user.email) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Email updates are not allowed for security reasons',
      });
    }

    // Update user fields
    const { firstName, lastName, phone, address } = req.body;
    let cloudinaryImageUrl = user.image;

    // Handle image upload
    if (req.file) {
      if (user.image) {
        await deleteFileFromCloudinary(user.image); // Delete old image if exists
      }
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'EcommercePern/users',
      });
      cloudinaryImageUrl = uploadResponse.secure_url; // Update new image URL
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.image = cloudinaryImageUrl;

    await user.save(); // Save updated user

    // Respond with updated user profile
    return successResponse(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      payload: { user },
    });

} catch (error) {
return errorResponse(res, {
statusCode: 500,
message: 'Failed to update profile',
});
}
}; also here is userSlice: //! Update Password
// Async thunk for updating the password
export const updatePassword = createAsyncThunk(
'user/updatePassword',
async (
{ id, oldPassword, newPassword, confirmedPassword },
{ rejectWithValue }
) => {
try {
const response = await axiosInstance.put(`/users/update-password/${id}`, {
oldPassword,
newPassword,
confirmedPassword,
});
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
); // Update Password
.addCase(updatePassword.pending, (state) => {
state.status = 'loading';
})
.addCase(updatePassword.fulfilled, (state, action) => {
state.status = 'succeeded';
state.updatePasswordMessage = action.payload.message;
})
.addCase(updatePassword.rejected, (state, action) => {
state.status = 'failed';
state.error = action.payload;
})

###### SEO

To create a dynamic, SEO-friendly footer with social media links and navigation for an eCommerce website, I will include all common social media platforms (Facebook, Twitter (X), Instagram, LinkedIn, YouTube, and Pinterest). The footer will feature dynamic content like the current year, social media icons, and navigation links for key sections of the site (products, company, support, etc.). Here's an example implementation using React, Material-UI, and best SEO practices:

<!-- userTable -->

now we will create userTable. here i want to share with you userTable from my another existing apps. userTable:import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, deleteUser } from './userSlice'
import { showSnackbar } from '../snackbar/snackbarSlice'
import { useNavigate } from 'react-router-dom'
import {
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Paper,
IconButton,
TextField,
Box,
Grid,
Dialog,
DialogActions,
DialogContent,
DialogContentText,
DialogTitle,
Button,
Pagination,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const UserTable = () => {
const dispatch = useDispatch()
const navigate = useNavigate()
const { users } = useSelector((state) => state.user)
const [search, setSearch] = useState('')
const [open, setOpen] = useState(false)
const [selectedUser, setSelectedUser] = useState(null)
const [currentPage, setCurrentPage] = useState(1)
const usersPerPage = 5

useEffect(() => {
dispatch(fetchAllUsers())
}, [dispatch])

const handleDelete = async (id) => {
try {
await dispatch(deleteUser(id)).unwrap()
dispatch(
showSnackbar({
message: 'Utilisateur supprimé avec succès',
severity: 'success',
})
)
dispatch(fetchAllUsers())
} catch (error) {
console.error("Échec de la suppression de l'utilisateur :", error)
dispatch(
showSnackbar({
message: `Échec de la suppression de l'utilisateur : ${error.message}`,
severity: 'error',
})
)
} finally {
handleClose()
}
}

const handleClickOpen = (user) => {
setSelectedUser(user)
setOpen(true)
}

const handleClose = () => {
setOpen(false)
setSelectedUser(null)
}

const handlePageChange = (event, value) => {
setCurrentPage(value)
}

const filteredUsers = Array.isArray(users)
? users.filter((user) =>
`${user.nom} ${user.prenom}`
.toLowerCase()
.includes(search.toLowerCase())
)
: []

const indexOfLastUser = currentPage \* usersPerPage
const indexOfFirstUser = indexOfLastUser - usersPerPage
const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
const pageCount = Math.ceil(filteredUsers.length / usersPerPage)

return (
<Box sx={{ mt: 3 }}>
<Grid container spacing={2}>
<Grid item xs={12}>
<TextField
fullWidth
label="Recherche par nom"
variant="outlined"
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
</Grid>
<Grid item xs={12}>
<TableContainer component={Paper}>

<Table>
<TableHead>
<TableRow>
<TableCell>ID</TableCell>
<TableCell>CP</TableCell>
<TableCell>Nom</TableCell>
<TableCell>Actions</TableCell>
</TableRow>
</TableHead>
<TableBody>
{currentUsers.map((user) => (
<TableRow key={user.id} hover>
<TableCell>{user.id}</TableCell>
<TableCell>{user.cp}</TableCell>
<TableCell>{user.nom}</TableCell>
<TableCell>
<Box sx={{ display: 'flex', gap: 1 }}>
<IconButton
sx={{ color: '#4caf50' }} // Couleur verte pour modifier
onClick={() => navigate(`/update-user/${user.id}`)} >
<EditIcon />
</IconButton>
<IconButton
sx={{ color: '#f44336' }} // Couleur rouge pour supprimer
onClick={() => handleClickOpen(user)} >
<DeleteIcon />
</IconButton>
</Box>
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</TableContainer>
<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
<Pagination
              count={pageCount}
              color="secondary"
              page={currentPage}
              onChange={handlePageChange}
            />
</Box>
</Grid>
</Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet utilisateur :{' '}
            {selectedUser?.nom} {selectedUser?.prenom} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annuler
          </Button>
          <Button
            onClick={() => handleDelete(selectedUser.id)}
            sx={{ color: '#f44336' }} // Couleur rouge pour le bouton de suppression
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

)
}

export default UserTable. this is an example for how we can fetch, update and delete user. now i share with you my current userSlice:import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance'; // Using axiosInstance for all API calls

// Helper function for handling rejected actions
const handleRejected = (state, action) => {
state.status = 'failed';
state.error = action.payload || 'An error occurred';
}; //! Fetch All Users
export const fetchAllUsers = createAsyncThunk(
'user/fetchUsers',
async (\_, { rejectWithValue }) => {
try {
const response = await axiosInstance.get('/users'); // Correct path
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
); //! Fetch User By ID
export const fetchUserById = createAsyncThunk(
'user/fetchUserById',
async (id, { rejectWithValue }) => {
try {
const response = await axiosInstance.get(`/users/${id}`); // Correct path
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! Update User By ID
export const updateUserById = createAsyncThunk(
'user/updateUserById',
async ({ id, userData }, { rejectWithValue }) => {
try {
const response = await axiosInstance.put(`/users/${id}`, userData); // Correct path
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
);

//! Delete User
export const deleteUser = createAsyncThunk(
'user/deleteUser',
async (id, { rejectWithValue }) => {
try {
const response = await axiosInstance.delete(`/users/${id}`); // Correct path
return response.data;
} catch (error) {
return rejectWithValue(error.response?.data || error.message);
}
}
); const userSlice = createSlice({
name: 'user',
initialState: {
user: null,
profile: null,
loggedIn: false,
error: null,
status: 'idle',
updatePasswordMessage: '',
},
reducers: {
loginUserSuccess(state, action) {
state.user = action.payload.user;
},
logoutUserReducer(state) {
state.user = null;
state.profile = null;
state.loggedIn = false;
},
}, // Fetch All Users
.addCase(fetchAllUsers.fulfilled, (state, action) => {
state.status = 'succeeded';
state.user = action.payload;
})
.addCase(fetchAllUsers.rejected, handleRejected)

      // Fetch User by ID
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserById.rejected, handleRejected)

      // Update User by ID
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUserById.rejected, handleRejected)

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = state.users.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUser.rejected, handleRejected) // Export actions

export const { loginUserSuccess, logoutUserReducer } = userSlice.actions;

// Export default reducer
export default userSlice.reducer; app/store.js:// app/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice'; // Import snackbar reducer
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
key: 'root',
storage,
whitelist: ['user'], // Only persist the user slice
};

const persistedUserReducer = persistReducer(persistConfig, userReducer); // Persist user slice

export const store = configureStore({
reducer: {
user: persistedUserReducer, // Using persisted reducer for user slice
snackbar: snackbarReducer, // Add snackbar reducer here
},
middleware: (getDefaultMiddleware) =>
getDefaultMiddleware({
serializableCheck: false, // Disables the serializable check for redux-persist
}),
});

export const persistor = persistStore(store);

##################################################
i have an error:POST /api/auth/refresh-token 401 0.324 ms - 56
POST /api/auth/refresh-token 401 0.330 ms - 56
POST /api/auth/refresh-token 401 0.521 ms - 56
POST /api/auth/refresh-token 401 0.327 ms - 56
POST /api/auth/refresh-token 401 0.306 ms - 56
POST /api/auth/refresh-token 401 0.410 ms - 56
POST /api/auth/refresh-token 401 0.322 ms - 56
POST /api/auth/refresh-token 401 0.290 ms - 56
POST /api/auth/refresh-token 401 0.318 ms - 56
POST /api/auth/refresh-token 401 0.305 ms - 56
POST /api/auth/refresh-token 401 0.288 ms - 56
POST /api/auth/refresh-token 401 0.376 ms - 56
POST /api/auth/refresh-token 401 0.298 ms - 56
POST /api/auth/refresh-token 401 0.496 ms - 56
POST /api/auth/refresh-token 401 0.312 ms - 56
POST /api/auth/refresh-token 401 0.289 ms - 56
POST /api/auth/refresh-token 401 0.478 ms - 56
POST /api/auth/refresh-token 401 0.329 ms - 56
POST /api/auth/refresh-token 401 0.323 ms - 56
POST /api/auth/refresh-token 401 0.353 ms - 56
POST /api/auth/refresh-token 401 0.364 ms - 56
POST /api/auth/refresh-token 401 0.464 ms - 56
POST /api/auth/refresh-token 401 0.415 ms - 56
POST /api/auth/refresh-token 401 0.567 ms - 56
POST /api/auth/refresh-token 401 0.511 ms - 56
POST /api/auth/refresh-token 401 0.444 ms - 56
POST /api/auth/refresh-token 401 0.391 ms - 56
POST /api/auth/refresh-token 401 0.455 ms - 56 , when user try to login with wrong email or password we cant handle this POST /api/auth/refresh-token 401 0.455 ms - 56. its randomly make error. here i want to share with you my existing authController:const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const {
successResponse,
errorResponse,
} = require('../controller/responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtAccessKey, jwtRefreshKey } = require('../secret');
const {
setAccessTokenCookie,
setRefreshTokenCookie,
} = require('../helper/cookie');

// Handle Login
const handleLogin = async (req, res, next) => {
try {
const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError(404, 'User does not exist. Please register.');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw createError(401, 'Email or password is incorrect.');
    }

    if (user.isBanned) {
      throw createError(403, 'You are banned. Contact the administrator.');
    }

    // Generate JWT tokens
    const accessToken = createJSONWebToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      jwtAccessKey,
      '15m'
    );
    const refreshToken = createJSONWebToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      jwtRefreshKey,
      '7d'
    );

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    const userWithoutPassword = user.get({ plain: true });
    delete userWithoutPassword.password;

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      payload: { user: userWithoutPassword },
    });

} catch (error) {
next(error); // Pass error to global error handler
}
};

// Handle Logout
const handleLogout = async (req, res, next) => {
try {
res.clearCookie('accessToken');
res.clearCookie('refreshToken');

    return successResponse(res, {
      statusCode: 200,
      message: 'Logout successful',
      payload: {},
    });

} catch (error) {
next(error); // Pass error to global error handler
}
};

//! Handle Refresh Token
const handleRefreshToken = async (req, res, next) => {
try {
const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      // If no refresh token is provided, return an unauthorized error
      throw createError(401, 'No refresh token provided.');
    }

    // Verify the old refresh token
    let decodedToken;
    try {
      decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);
    } catch (error) {
      console.error('Refresh Token Verification Error:', error.message);
      // If refresh token is invalid or expired, send a 403 (Forbidden) response
      throw createError(403, 'Invalid or expired refresh token.');
    }

    // Create a new access token based on the decoded refresh token information
    const accessToken = createJSONWebToken(
      {
        id: decodedToken.id,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
      },
      jwtAccessKey,
      '15m' // New access token valid for 15 minutes
    );

    // Set the new access token as an HTTP-only cookie
    setAccessTokenCookie(res, accessToken);

    return successResponse(res, {
      statusCode: 200,
      message: 'New access token generated',
      payload: { accessToken },
    });

} catch (error) {
next(error); // Pass error to global error handler
}
};

//! Protected Route Handler
const handleProtectedRoute = async (req, res, next) => {
try {
const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw createError(401, 'No access token provided. Please log in.');
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(accessToken, jwtAccessKey);
    } catch (error) {
      throw createError(
        401,
        'Invalid or expired access token. Please log in again.'
      );
    }

    const tokenExpirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeRemaining = tokenExpirationTime - currentTime;

    // Automatically renew the access token if it's about to expire (within 5 mins)
    if (timeRemaining < 5 * 60 * 1000) {
      const newAccessToken = createJSONWebToken(
        {
          id: decodedToken.id,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
        },
        jwtAccessKey,
        '15m'
      );
      setAccessTokenCookie(res, newAccessToken);
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Accessed protected resources successfully',
      payload: {
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
        },
      },
    });

} catch (error) {
next(error); // Pass error to global error handler
}
};

module.exports = {
handleLogin,
handleLogout,
handleRefreshToken,
handleProtectedRoute,
}; and userSlice:import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance'; // Using axiosInstance for all API calls

// Helper function for handling rejected actions
const handleRejected = (state, action) => {
state.status = 'failed';
state.error = action.payload || 'An error occurred';
};export const refreshAccessToken = createAsyncThunk(
'user/refreshAccessToken',
async (\_, { rejectWithValue }) => {
try {
const response = await axiosInstance.post('/auth/refresh-token');
return response.data;
} catch (error) {
// Properly handle errors here
return rejectWithValue(error.response?.data || error.message);
}
}
); const userSlice = createSlice({
name: 'user',
initialState: {
user: [],
profile: null,
loggedIn: false,
error: null,
status: 'idle',
updatePasswordMessage: '',
},
reducers: {
loginUserSuccess(state, action) {
state.user = action.payload.user;
},
logoutUserReducer(state) {
state.user = null;
state.profile = null;
state.loggedIn = false;
},
}, // Refresh Access Token
.addCase(refreshAccessToken.fulfilled, (state, action) => {
state.loggedIn = true;
state.user = action.payload; // Store the new access token
})
.addCase(refreshAccessToken.rejected, (state, action) => {
state.loggedIn = false; // Ensure loggedIn state is false on error
state.error = action.payload || 'Token refresh failed'; // Handle error
}) could you review and update and impliment all the updated code with existing code ? also i want to know why and how its happen ? here is: authRouter:const express = require('express');
const {
handleLogin,
handleLogout,
handleRefreshToken,
handleProtectedRoute,
} = require('../controller/authController');
const { validateUserLogin } = require('../validators/user');
const runValidation = require('../validators');
const { isLoggedIn } = require('../middleware/authMiddleware');

const authRouter = express.Router();

/\*\*

- Authentication Routes
  \*/
  authRouter.post('/login', validateUserLogin, runValidation, handleLogin); // Login route
  authRouter.post('/logout', handleLogout); // Logout route

/\*\*

- Token Routes
  \*/
  authRouter.post('/refresh-token', handleRefreshToken); // Refresh token route

/\*\*

- Protected Routes
  \*/
  authRouter.get('/protected', handleProtectedRoute); // Access protected resource

module.exports = authRouter;

############

here is existing Navbar:// src/layouts/Navbar.jsx
import { useEffect, useState } from 'react';
import {
AppBar,
Toolbar,
IconButton,
Typography,
Drawer,
List,
ListItem,
ListItemText,
Menu,
MenuItem,
Avatar,
Button,
Box,
ListItemIcon,
} from '@mui/material';
import {
Menu as MenuIcon,
Home as HomeIcon,
ShoppingCart as ShoppingCartIcon,
Dashboard as DashboardIcon,
ExitToApp as ExitToAppIcon,
Login as LoginIcon,
VpnKey as PasswordIcon,
HelpOutline as HelpIcon,
ContactMail as ContactMailIcon,
AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
logoutUser,
logoutUserReducer,
fetchUserProfile,
refreshAccessToken,
} from '../features/user/userSlice';
import { showSnackbar } from '../features/snackbar/snackbarSlice';

const Navbar = () => {
const dispatch = useDispatch();
const navigate = useNavigate(); // Initialize useNavigate
const { profile, loggedIn } = useSelector((state) => state.user);
const [drawerOpen, setDrawerOpen] = useState(false);
const [anchorEl, setAnchorEl] = useState(null);
const isMenuOpen = Boolean(anchorEl);

// Toggle drawer for mobile
const toggleDrawer = (open) => (event) => {
if (
event.type === 'keydown' &&
(event.key === 'Tab' || event.key === 'Shift')
) {
return;
}
setDrawerOpen(open);
};

// Handle Menu open/close for user profile
const handleMenuOpen = (event) => {
setAnchorEl(event.currentTarget);
};
const handleMenuClose = () => {
setAnchorEl(null);
};

// Handle Logout
const handleLogout = () => {
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
dispatch(logoutUser());
dispatch(logoutUserReducer());

    // Trigger Snackbar
    dispatch(
      showSnackbar({ message: 'Successfully logged out', severity: 'success' })
    );

    handleMenuClose();

};

useEffect(() => {
const token = localStorage.getItem('accessToken');
if (token) {
if (loggedIn && !profile) {
dispatch(fetchUserProfile());
} else if (!loggedIn) {
dispatch(refreshAccessToken())
.unwrap()
.then(() => {
dispatch(fetchUserProfile());
})
.catch((error) => {
console.error('Failed to refresh token', error);
dispatch(logoutUser());
});
}
}
}, [loggedIn, profile, dispatch]);

const userFirstName = profile?.user?.firstName || 'User';
const userLastName = profile?.user?.lastName || 'Unknown';
const userImage = profile?.user?.image || '/assets/images/default-avatar.png';

return (
<>
<AppBar position="fixed">
<Toolbar sx={{ justifyContent: 'space-between' }}>
{/_ Left side: Menu icon for mobile and links for desktop _/}
<Box sx={{ display: { xs: 'block', md: 'none' } }}>
<IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
<MenuIcon />
</IconButton>
</Box>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              <HomeIcon />
              Home
            </Button>
            <Button color="inherit" component={Link} to="/cart">
              <ShoppingCartIcon />
              Cart
            </Button>
            <Button color="inherit" component={Link} to="/contact-us">
              <ContactMailIcon />
              Contact Us
            </Button>
            <Button color="inherit" component={Link} to="/update-user-profile">
              <ContactMailIcon />
              Update Profile
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate(`/update-user/${profile?.user?.id}`)} // Navigate to update user by ID
            >
              <ContactMailIcon />
              Update User
            </Button>
          </Box>

          {/* Right side: Profile or Login */}
          {loggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {userFirstName} {userLastName}
              </Typography>
              <IconButton
                edge="end"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar
                  src={userImage}
                  alt={`${userFirstName} ${userLastName}`}
                />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem
                  disabled
                >{`Hello, ${userFirstName} ${userLastName}`}</MenuItem>
                <MenuItem component={Link} to="/profile">
                  <AccountCircleIcon />
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToAppIcon />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              <LoginIcon />
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            <ListItem button component={Link} to="/cart">
              <ListItemIcon>
                <ShoppingCartIcon color="secondary" />
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>

            <ListItem button component={Link} to="/contact-us">
              <ListItemIcon>
                <ContactMailIcon color="info" />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>
            <ListItem button component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            {loggedIn && (
              <>
                <ListItem button component={Link} to="/profile">
                  <ListItemIcon>
                    <AccountCircleIcon color="info" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button component={Link} to="/update-password">
                  <ListItemIcon>
                    <PasswordIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Update Password" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>

);
};

export default Navbar; and here is updateUserById:import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUserById } from '../../features/user/userSlice';
import {
Card,
CardContent,
TextField,
Button,
Typography,
Box,
Avatar,
Snackbar,
CircularProgress,
IconButton,
Grid,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateUserById = () => {
const { id } = useParams(); // Get the ID from URL params
const dispatch = useDispatch();
const navigate = useNavigate();
const user = useSelector((state) => state.user.user); // Access the user data from the store
const [formData, setFormData] = useState({
firstName: '',
lastName: '',
phone: '',
address: '',
image: '',
});

const [snackbarState, setSnackbarState] = useState({
open: false,
message: '',
severity: 'success',
});

const [imagePreview, setImagePreview] = useState('');

// Fetch user data when component mounts
useEffect(() => {
dispatch(fetchUserById(id)); // Dispatch the action to fetch user by ID
}, [dispatch, id]);

// Update form data when user data changes
useEffect(() => {
if (user) {
setFormData({
firstName: user.firstName || '',
lastName: user.lastName || '',
phone: user.phone || '',
address: user.address || '',
image: user.image || '',
});
setImagePreview(user.image || '');
}
}, [user]);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onload = () => {
setImagePreview(reader.result);
setFormData((prevFormData) => ({
...prevFormData,
image: file,
}));
};
reader.readAsDataURL(file);
}
};

const handleSubmit = async (e) => {
e.preventDefault();
const data = new FormData();
data.append('firstName', formData.firstName);
data.append('lastName', formData.lastName);
data.append('phone', formData.phone);
data.append('address', formData.address);
if (formData.image) {
data.append('image', formData.image);
}

    try {
      await dispatch(updateUserById({ id, userData: data })).unwrap();
      setSnackbarState({
        open: true,
        message: 'User updated successfully',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to dashboard or desired page
      }, 1500);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Failed to update user',
        severity: 'error',
      });
    }

};

const handleSnackbarClose = () => {
setSnackbarState((prevState) => ({ ...prevState, open: false }));
};

// Loading state while fetching user
if (!user) {
return (
<Box
sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }} >
<CircularProgress color="secondary" />
</Box>
);
}

return (
<Box
sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'background.default',
      }} >
<Card
sx={{
          width: 600,
          backgroundColor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 3,
          padding: 2,
        }} >
<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
<Avatar
src={imagePreview}
alt={`${formData.firstName} ${formData.lastName}`}
sx={{ width: 120, height: 120 }}
/>
</Box>
<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
<IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
          >
<input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
<PhotoCamera />
</IconButton>
</Box>
<Typography
variant="h5"
component="div"
color="secondary.main"
sx={{ mb: 2 }} >
Update User
</Typography>
<CardContent>

<form onSubmit={handleSubmit}>
<Grid container spacing={2} sx={{ mb: 2 }}>
<Grid item xs={6}>
<TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
</Grid>
<Grid item xs={6}>
<TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
</Grid>
</Grid>
<Grid container spacing={2} sx={{ mb: 2 }}>
<Grid item xs={6}>
<TextField
                  label="Phone"
                  variant="outlined"
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
</Grid>
<Grid item xs={6}>
<TextField
                  label="Address"
                  variant="outlined"
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
</Grid>
</Grid>
<Button
type="submit"
variant="contained"
color="primary"
fullWidth
sx={{ mt: 2 }} >
Update User
</Button>
</form>
</CardContent>
</Card>
<Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarState.message}
      />
</Box>
);
};

export default UpdateUserById; and updateUserProfile:import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
updateUserProfile,
fetchUserProfile,
} from '../../features/user/userSlice';
import {
Card,
CardContent,
TextField,
Button,
Typography,
Box,
Avatar,
Snackbar,
CircularProgress,
IconButton,
Grid,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import theme from './theme';

const UpdateUserProfile = () => {
const dispatch = useDispatch();
const navigate = useNavigate();
const { profile, loading } = useSelector((state) => state.user);

const [formData, setFormData] = useState({
firstName: '',
lastName: '',
phone: '',
address: '',
image: '',
});

const [emailWarning, setEmailWarning] = useState(false);
const [snackbarState, setSnackbarState] = useState({
open: false,
message: '',
severity: 'success',
});

const [imagePreview, setImagePreview] = useState('');

useEffect(() => {
if (profile && profile.user) {
setFormData({
firstName: profile.user.firstName || '',
lastName: profile.user.lastName || '',
phone: profile.user.phone || '',
address: profile.user.address || '',
image: profile.user.image || '',
});
setImagePreview(profile.user.image || '');
}
}, [profile]);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});

    if (e.target.name === 'email' && e.target.value !== profile?.user?.email) {
      setEmailWarning(true);
    } else {
      setEmailWarning(false);
    }

};

const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onload = () => {
setImagePreview(reader.result);
setFormData((prevFormData) => ({
...prevFormData,
image: file,
}));
};
reader.readAsDataURL(file);
}
};

const handleSubmit = async (e) => {
e.preventDefault();

    if (emailWarning) {
      alert('Email updates are not allowed for security reasons');
      return;
    }

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await dispatch(updateUserProfile(data)).unwrap();
      setSnackbarState({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });

      await dispatch(fetchUserProfile());
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    }

};

const handleReturn = () => {
navigate('/profile'); // Navigate back to profile
};

const handleSnackbarClose = () => {
setSnackbarState((prevState) => ({ ...prevState, open: false }));
};

if (loading || !profile || !profile.user) {
return (
<Box
sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }} >
<CircularProgress color="secondary" />
</Box>
);
}

return (
<ThemeProvider theme={theme}>
<Box
sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
        }} >
<Card
sx={{
            width: 600,
            backgroundColor: 'background.paper',
            borderRadius: '20px',
            boxShadow: 3,
            textAlign: 'center',
            padding: 2,
            marginTop: 6,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }} >
<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
<Avatar
src={imagePreview}
alt={`${profile?.user?.firstName || ''} ${
                profile?.user?.lastName || ''
              }`}
sx={{
                width: 120,
                height: 120,
                border: '4px solid',
                borderColor: 'secondary.main',
              }}
/>
</Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageChange}
              />
              <PhotoCamera />
            </IconButton>
          </Box>

          <Typography
            variant="h5"
            component="div"
            color="secondary.main"
            sx={{ mb: 2 }}
          >
            Update Profile
          </Typography>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Phone"
                    type="text"
                    variant="outlined"
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Address"
                    variant="outlined"
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  value={profile?.user?.email || ''}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>

              <Button
                onClick={handleReturn}
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Return to Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbarState.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarState.message}
        />
      </Box>
    </ThemeProvider>

);
};

export default UpdateUserProfile; i want to updateUserProfile by indivisual user when user will loggedIn. that is working fine. also for admin in the dashboard i want to updateUserById means admin also can update user their own Id. also admin can delete ById if admin needed. so now verify my existing Navbar that is this the correct path that i used for updateUserProfile and also updateUserById ? in fact i think you can understand my idea or plan. i want both way update user. for indivisual user can update their own profile. also admin can update ById. now i have a question. what is the best practic for handle update user. ofcourse user can update their own profile. but is it necessary to updateUserById for admin ? because now redux store received successfuly updateUserById but in the form filed user data does not populated.so what should i do for the best practic in my ecommerce website. i think you can understand everything. remember that updateUserProfile is working fine. i dont want to change anything for profile part. also remember that we use cookies HTTP only. not local storage.

Given your requirements, let’s break down the best practices and adjustments that can streamline your user update workflow for both individual users and admins in your e-commerce platform.

Overview of Your Requirements
Individual Users: Can update their profile (e.g., /update-user-profile route).
Admins: Can update any user by ID (e.g., /update-user/:id route) and potentially delete users.
Recommendations for Best Practices
Keep Separate Endpoints and Logic for Profile and Admin Updates:

Individual User Profile Update (/update-user-profile): Allows users to update their profile data without needing an ID. The data is fetched from the authenticated user's profile directly, which is working fine, so no changes are needed here.
Admin User Update by ID (/update-user/:id): Allows admins to edit the data of any user by specifying the user ID. This should be accessible only if the authenticated user is an admin.
Separate Redux Actions and Slice Logic:

Fetch and Update Actions: Since admins need the ability to fetch and update any user's data, you should ensure that the fetchUserById and updateUserById actions handle fetching and updating a user by their ID.
User Profile and Admin User Store Segregation: Storing individual user profile data (fetchUserProfile and updateUserProfile) separately from admin-related fetches by ID (fetchUserById and updateUserById) can help avoid unintended data overwrites and make debugging easier.
Verify Route Paths in Navbar:

For individual users, the path /update-user-profile is correct as it directly links to the logged-in user’s profile update form.
For admins, the path /update-user/:id is also correct as it allows targeting a specific user by ID for updates. Ensure that the link includes a valid ID for any user being updated.
Improving the updateUserById Form for Admins
If the Redux store is updating but the form fields are not populated, the issue may lie in how the component fetches and uses the data. Here are steps to enhance this:

1. Make Sure fetchUserById Runs on Component Mount:
   Ensure that the id from useParams() is correctly passed to fetchUserById when the component mounts.
   Verify that user in the store contains the correct user data by ID before rendering the form.
2. Update the UpdateUserById Component to Populate the Form Fields:
   To ensure the form is populated when data is available, include checks within useEffect. Here’s a refined approach for UpdateUserById:

#####

Verification Checklist:
Your profile:

✅ No "Add Friend" button

✅ Shows editing buttons

Other users' profiles:

✅ Shows "Add Friend" button

✅ No editing buttons

This is the simplest, most direct solution to your exact requirement. The key is properly passing (or not passing) the handleAddFriend prop based on isOwnProfile.
<ProfileHeader
userData={{
    coverImage,
    profileImage,
    fullName: `${publicProfile.firstName} ${publicProfile.lastName}`,
    isCurrentUser: isOwnProfile,  // This is the critical line
    isVerified: publicProfile.isVerified
  }}
isMobile={false}
navigate={navigate}
onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : null}
onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : null}
coverImageLoading={updatePhotoStatus === 'loading'}
// Only pass handleAddFriend if NOT current user's profile
handleAddFriend={!isOwnProfile ? handleAddFriend : undefined}
/>

##

<ProfileHeader
userData={{
    coverImage,
    profileImage,
    fullName: `${publicProfile.firstName} ${publicProfile.lastName}`,
    isCurrentUser: isOwnProfile, // MUST be true for your own profile
    isVerified: publicProfile.isVerified,
    userId: publicProfile.id // Pass the actual profile ID
  }}
isMobile={false}
// Only pass handleAddFriend for OTHER profiles
showAddFriend={!isOwnProfile}
onAddFriend={handleAddFriend}
// ... other props
/>

{/_ <ProfileHeader
userData={{
    coverImage,
    profileImage,
    fullName: `${publicProfile.firstName} ${publicProfile.lastName}`,
    isCurrentUser: isOwnProfile,
    isVerified: publicProfile.isVerified
  }}
isMobile={false}
navigate={navigate}
onCoverPhotoEdit={isOwnProfile ? () => coverInputRef.current.click() : null}
onProfilePhotoEdit={isOwnProfile ? () => profileInputRef.current.click() : null}
coverImageLoading={updatePhotoStatus === 'loading'}
handleAddFriend={!isOwnProfile ? handleAddFriend : null}
/> _/}

{/_ <ProfileHeader
userData={{
    coverImage,
    profileImage,
    fullName: `${publicProfile.firstName} ${publicProfile.lastName}`,
    isCurrentUser: isOwnProfile,  // This is the critical line
    isVerified: publicProfile.isVerified
  }}
isMobile={false}
navigate={navigate}
onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : null}
onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : null}
coverImageLoading={updatePhotoStatus === 'loading'}
// Only pass handleAddFriend if NOT current user's profile
handleAddFriend={!isOwnProfile ? handleAddFriend : undefined}
/> _/}




###### Profile Action  

### **Key Difference in Action Buttons (Own Profile vs. Others' Profile):**  
1. **Facebook (our Goal):**  
   - **Own Profile:** Shows **"Add to story," "See all"** (focused on *managing your own content*).  
   - **Others' Profile:** Shows **"Message," "Follow," "Add friend"** (focused on *interacting with others*).  

   ### **Recommendation:**  
- Mirror Facebook’s logic:  
  - Hide "Edit Profile" on others’ profiles.  
  - Hide "Follow/Message" on your own profile.  
  - Use clear, functional buttons (not placeholders like [ ]).  

2. **our SocialApp (Current State):**  
   - **Own Profile :** No clear action buttons (just "MESSAGE" and tabs).  
   - **Others' Profile :** Broken/unclear buttons (empty checkboxes).  

### **What’s Missing in Your App:**  
- **Own Profile:** Should have buttons like **"Edit Profile," "Add Post/Story," "Manage Friends"** (user-controlled actions).  
- **Others' Profile:** Should show **"Message," "Follow," "Add Friend"** (interaction options).  

### **Recommendation:**  
- Mirror Facebook’s logic:  
  - Hide "Edit Profile" on others’ profiles.  
  - Hide "Follow/Message" on your own profile.  
  - Use clear, functional buttons (not placeholders like [ ]).  

This separation ensures users intuitively know *whose profile they’re viewing* and what actions they can take. Would you like mockups for how to implement this?