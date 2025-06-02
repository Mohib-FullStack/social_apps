//! new
import { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Route, Routes } from 'react-router-dom';
import { store } from './app/store'; // Import the store
import socketService from './utils/socket'; // Import socket service
import ActivatePage from './components/ACTIVATE/ActivatePage';
import Chat from './components/Chat/Chat';
import ContactUs from './components/CONTACT-US/ContactUs';
import Dashboard from './components/DASHBOARD/Dashboard';
import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
import HomePage from './components/HOME/Home';
import Login from './components/LOGIN/Login';
import NotFound from './components/NOTFOUND/NotFound';
import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
import FriendRequestsPage from './components/FriendsListPage/FriendRequestsPage';
import Register from './components/REGISTER/Register';
import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
import UserTable from './components/USER-TABLE/UserTable';
import { SocketProvider } from './context/SocketContext';
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar/Navbar';
import NotificationsPage from './components/NOTIFICATION/NotificationsPage';

const App = () => {
useEffect(() => {
  // Initialize socket connection
  socketService.connect();
  
  return () => {
    socketService.disconnect();
  };
}, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SocketProvider>
        <>
          <Navbar />
          <GlobalSnackbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Profile Routes */}
            <Route path="/profile/me" element={<PrivateProfilePage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
            <Route path="/friend-requests" element={<FriendRequestsPage />} />
            <Route path="/update-user/:id" element={<UpdateUserById />} />
            <Route path="/user-table" element={<UserTable />} />

            {/* Notifications */}
                    
<Route path="/notifications" element={<NotificationsPage />} />

            {/* Chat Routes */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:chatId" element={<Chat />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </>
      </SocketProvider>
    </LocalizationProvider>
  );
};

export default App;


//! running
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Route, Routes } from 'react-router-dom';
// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import Chat from './components/Chat/Chat';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import NotFound from './components/NOTFOUND/NotFound';
// import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
// import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
// import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
// import FriendRequestsPage from './components/FriendsListPage/FriendRequestsPage';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UserTable from './components/USER-TABLE/UserTable';
// import { SocketProvider } from './context/SocketContext';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar/Navbar';
// import Notification from './components/NOTIFICATION/Notification';


// const App = () => {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <SocketProvider>
//         <>
//           {/* Navbar at the top */}
//           <Navbar />

//           {/* Snackbar for global notifications */}
//           <GlobalSnackbar />

//           {/* Route definitions */}
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<HomePage />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/activate" element={<ActivatePage />} />
//             <Route path="/contact-us" element={<ContactUs />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password/:token" element={<ResetPassword />} />

//             {/* Profile Routes */}
//             <Route path="/profile/me" element={<PrivateProfilePage />} />
//             <Route path="/profile/:id" element={<PublicProfilePage />} />

//             {/* Protected/User-Specific Routes */}
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/update-password" element={<UpdatePassword />} />
//             <Route
//               path="/my-profile-update"
//               element={<PrivateProfileUpdate />}
//             />

//             <Route path="/friend-requests" element={<FriendRequestsPage />} />
//             <Route path="/update-user/:id" element={<UpdateUserById />} />
//             <Route path="/user-table" element={<UserTable />} />

//             {/* Notifications */}
//             <Route path="/notifications" element={<Notification />} />

//             {/* Chat Routes */}
//             <Route path="/chat" element={<Chat />} />
//             <Route path="/chat/:chatId" element={<Chat />} />

//             {/* 404 - Not Found Route */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>

//           {/* Footer at the bottom */}
//           <Footer />
//         </>
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;


