import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Route, Routes } from 'react-router-dom';
import ActivatePage from './components/ACTIVATE/ActivatePage';
import CartPage from './components/CART/CartPage';
import CategoryTable from './components/CATEGORY-TABLE/CategoryTable';
import CreateCategory from './components/CATEGORY/CreateCategory';
import UpdateCategory from './components/CATEGORY/UpdateCategory';
import CheckoutPage from './components/CheckoutPage/CheckoutPage ';
import ContactUs from './components/CONTACT-US/ContactUs';
import Dashboard from './components/DASHBOARD/Dashboard';
import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
import HomePage from './components/HOME/Home';
import Login from './components/LOGIN/Login';
import NotFound from './components/NOTFOUND/NotFound';
import OrderTable from './components/OrderTrack/OrderTable';
import OrderTrackPage from './components/OrderTrack/OrderTrackPage';
import PaymentPage from './components/PAYMENT/Payment';
import CreateProduct from './components/PRODUCT/CreateProduct';
import ProductDetails from './components/PRODUCT/ProductDetails';
import ProductDisplay from './components/PRODUCT/ProductDisplay';
import ProductTable from './components/PRODUCT/ProductTable';
import UpdateProduct from './components/PRODUCT/UpdateProduct';
import Profile from './components/PROFILE/Profile';
import UpdateUserProfile from './components/PROFILE/UpdateUserProfile';
import Register from './components/REGISTER/Register';
import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
import ThankYouPage from './components/Thank-You/Thank-You-Page';
import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
import UserTable from './components/USER-TABLE/UserTable';
import { SocketProvider } from './context/SocketContext'; // Import the SocketProvider
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar';
import ChatPage from './components/ChatComponents/ChatPage';


const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <SocketProvider> {/* Wrap everything with SocketProvider */}
      <>
        {/* Navbar at the top */}
        <Navbar />

        {/* Snackbar for global notifications */}
        <GlobalSnackbar />

        {/* Route definitions */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
             <Route path="/activate" element={<ActivatePage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected/User-Specific Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/update-user-profile" element={<UpdateUserProfile />} />
          <Route path="/update-user/:id" element={<UpdateUserById />} />
          <Route path="/user-table" element={<UserTable />} />
          <Route path="/category" element={<CreateCategory />} />
          <Route path="/update-category/:slug" element={<UpdateCategory />} />
          <Route path="/category-table" element={<CategoryTable />} />
          <Route path="/product" element={<CreateProduct />} />
          <Route path="/update-product/:slug" element={<UpdateProduct />} />
          <Route path="/product-table" element={<ProductTable />} />
          <Route path="/product-display" element={<ProductDisplay />} />
          <Route path="/product-details/:slug" element={<ProductDetails />} />
          <Route path="/cart-page" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/track/:orderId" element={<OrderTrackPage />} />
          <Route path="/order-table" element={<OrderTable />} />
   
<Route path="/chat" element={<ChatPage />} />
<Route path="/chat/:chatId" element={<ChatPage />} />

          {/* 404 - Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Footer at the bottom */}
        <Footer />
      </>
    </SocketProvider>
    </LocalizationProvider>
  );
};

export default App;










// import { Route, Routes } from 'react-router-dom';
// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import CartPage from './components/CART/CartPage';
// import CategoryTable from './components/CATEGORY-TABLE/CategoryTable';
// import CheckoutPage from './components/CheckoutPage/CheckoutPage ';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import CreateCategory from './components/CATEGORY/CreateCategory';
// import CreateProduct from './components/PRODUCT/CreateProduct';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import Footer from './layouts/Footer';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import Navbar from './layouts/Navbar';
// import NotFound from './components/NOTFOUND/NotFound';
// import PaymentPage from './components/PAYMENT/Payment';
// import ProductDetails from './components/PRODUCT/ProductDetails';
// import ProductDisplay from './components/PRODUCT/ProductDisplay';
// import ProductTable from './components/PRODUCT/ProductTable';
// import Profile from './components/PROFILE/Profile';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import ThankYouPage from './components/Thank-You/Thank-You-Page';
// import OrderTrackPage from './components/OrderTrack/OrderTrackPage';
// import UpdateCategory from './components/CATEGORY/UpdateCategory';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateProduct from './components/PRODUCT/UpdateProduct';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UpdateUserProfile from './components/PROFILE/UpdateUserProfile';
// import UserTable from './components/USER-TABLE/UserTable';
// import OrderTable from './components/OrderTrack/OrderTable';

// // import OrderPage from './components/ORDER/Order'
// // import OrderDetailsPage from './components/ORDER/OrderDetails'

// const App = () => {
//   return (
//     <>
//       {/* Navbar at the top */}
//       <Navbar />

//       {/* Snackbar for global notifications */}
//       <GlobalSnackbar />

//       {/* Route definitions */}
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/activate" element={<ActivatePage />} />
//         <Route path="/contact-us" element={<ContactUs />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} />

//         {/* Protected/User-Specific Routes */}
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/update-password" element={<UpdatePassword />} />
//         <Route path="/update-user-profile" element={<UpdateUserProfile />} />
//         <Route path="/update-user/:id" element={<UpdateUserById />} />
//         <Route path="/user-table" element={<UserTable />} />
//         <Route path="/category" element={<CreateCategory />} />
//         <Route path="/update-category/:slug" element={<UpdateCategory />} />
//         <Route path="/category-table" element={<CategoryTable />} />
//         <Route path="/product" element={<CreateProduct />} />
//         <Route path="/update-product/:slug" element={<UpdateProduct />} />
//         <Route path="/product-table" element={<ProductTable />} />
//         <Route path="/product-display" element={<ProductDisplay />} />
//         <Route path="/product-details/:slug" element={<ProductDetails />} />
//         <Route path="/cart-page" element={<CartPage />} />
//         <Route path="/checkout" element={<CheckoutPage />} />
//         {/* <Route path="/create" element={<OrderPage />} />
//         <Route path="/:orderId" element={<OrderDetailsPage />} /> */}
//         <Route path="/payment" element={<PaymentPage />} />
//         <Route path="/thank-you" element={<ThankYouPage />} />
//         <Route path="/track/:orderId" element={<OrderTrackPage />} />
//         <Route path="/order-table" element={<OrderTable />} />

//         {/* 404 - Not Found Route */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>

//       {/* Footer at the bottom */}
//       <Footer />
//     </>
//   );
// };

// export default App;
