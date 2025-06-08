import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import ActivatePage from './components/ACTIVATE/ActivatePage';
import Chat from './components/Chat/Chat';
import ContactUs from './components/CONTACT-US/ContactUs';
import Dashboard from './components/DASHBOARD/Dashboard';
import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
import FriendRequestsPage from './components/Friends/FriendRequestsPage';
import HomePage from './components/HOME/Home';
import Login from './components/LOGIN/Login';
import NotFound from './components/NOTFOUND/NotFound';
import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
import Register from './components/REGISTER/Register';
import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
import UserTable from './components/USER-TABLE/UserTable';
import { SocketProvider } from './context/SocketContext';
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar/Navbar';
import socketService from './utils/socket';
import SocketFriendshipHandler from './components/SocketHandlers/SocketFriendshipHandler';

const App = () => {
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SocketProvider>
        <>
          <SocketFriendshipHandler />
          <Navbar />
          <GlobalSnackbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile/me" element={<PrivateProfilePage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
            <Route path="/friendships" element={<FriendRequestsPage />} />
            <Route path="/update-user/:id" element={<UpdateUserById />} />
            <Route path="/user-table" element={<UserTable />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </>
      </SocketProvider>
    </LocalizationProvider>
  );
};

export default App;


//! previous version
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { useEffect } from 'react';
// import { Route, Routes } from 'react-router-dom';
// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import Chat from './components/Chat/Chat';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import FriendRequestsPage from './components/Friends/FriendRequestsPage';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import NotFound from './components/NOTFOUND/NotFound';
// import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
// import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
// import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UserTable from './components/USER-TABLE/UserTable';
// import { SocketProvider } from './context/SocketContext';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar/Navbar';
// import socketService from './utils/socket';

// const App = () => {
//   useEffect(() => {
//     socketService.connect();
//     return () => {
//       socketService.disconnect();
//     };
//   }, []);

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <SocketProvider>
//         <>
//           <Navbar />
//           <GlobalSnackbar />
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/activate" element={<ActivatePage />} />
//             <Route path="/contact-us" element={<ContactUs />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password/:token" element={<ResetPassword />} />
//             <Route path="/profile/me" element={<PrivateProfilePage />} />
//             <Route path="/profile/:id" element={<PublicProfilePage />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/update-password" element={<UpdatePassword />} />
//             <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
//             <Route path="/friendships" element={<FriendRequestsPage />} />
//             <Route path="/update-user/:id" element={<UpdateUserById />} />
//             <Route path="/user-table" element={<UserTable />} />
//             <Route path="/chat" element={<Chat />} />
//             <Route path="/chat/:chatId" element={<Chat />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//           <Footer />
//         </>
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;

//! running
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { useEffect, useState } from 'react';
// import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import Chat from './components/Chat/Chat';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import FriendRequestsPage from './components/Friends/FriendRequestsPage';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import NotFound from './components/NOTFOUND/NotFound';
// import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
// import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
// import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UserTable from './components/USER-TABLE/UserTable';

// import { SocketProvider } from './context/SocketContext';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar/Navbar';

// // NEW imports for notification drawer
// import NotificationPanel from './features/notification/NotificationPanel';
// import socketService from './utils/socket';

// const App = () => {
//   const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Initialize socket connection on mount
//     socketService.connect();
//     return () => {
//       socketService.disconnect();
//     };
//   }, []);

//   // Whenever the path is exactly "/notifications", open the drawer.
//   useEffect(() => {
//     if (location.pathname === '/notifications') {
//       setNotificationDrawerOpen(true);
//     }
//   }, [location.pathname]);

//   // When the drawer closes, if we're still on "/notifications", push back to "/"
//   // const handleCloseNotifications = () => {
//   //   setNotificationDrawerOpen(false);

//   //   if (location.pathname === '/notifications') {
//   //     // Optionally navigate somewhere else; here we go to "/"
//   //     navigate('/');
//   //   }
//   // };

//   // When the drawer closes, if we're still on "/notifications", push back to "/"
// const handleCloseNotifications = () => {
//   setNotificationDrawerOpen(false);

//   if (location.pathname === '/notifications') {
//     navigate('/');
//   }
// };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <SocketProvider>
//         <>
//           {/* Pass a prop to Navbar so clicking bell opens the drawer */}
//           <Navbar onNotificationClick={() => navigate('/notifications')} />

//           {/* Global snackbar for toasts */}
//           <GlobalSnackbar />

//           {/* Notification drawer */}
//           <NotificationPanel
//             open={notificationDrawerOpen}
//             onClose={handleCloseNotifications}
//           />

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

//             {/* Protected Routes */}
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/update-password" element={<UpdatePassword />} />
//             <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
//             <Route path="/friendships" element={<FriendRequestsPage />} />
//             <Route path="/update-user/:id" element={<UpdateUserById />} />
//             <Route path="/user-table" element={<UserTable />} />

//             {/* Chat Routes */}
//             <Route path="/chat" element={<Chat />} />
//             <Route path="/chat/:chatId" element={<Chat />} />

//             {/* 404 */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>

//           <Footer />
//         </>
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;



//! Previous 
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { useEffect } from 'react';
// import { Route, Routes } from 'react-router-dom';
// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import Chat from './components/Chat/Chat';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import FriendRequestsPage from './components/Friends/FriendRequestsPage';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import NotFound from './components/NOTFOUND/NotFound';
//  import NotificationPage from './components/NOTIFICATION/NotificationPage';
// import PrivateProfilePage from './components/PROFILE/PrivateProfile/PrivateProfilePage';
// import PrivateProfileUpdate from './components/PROFILE/PrivateProfile/PrivateProfileUpdate';
// import PublicProfilePage from './components/PROFILE/PublicProfile/PublicProfilePage';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UserTable from './components/USER-TABLE/UserTable';
// import { SocketProvider } from './context/SocketContext';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar/Navbar';
// import socketService from './utils/socket'; // Import socket service
// // import NotificationPanel from './components/NOTIFICATION/NotificationPanel';

// const App = () => {
// useEffect(() => {
//   // Initialize socket connection
//   socketService.connect();
  
//   return () => {
//     socketService.disconnect();
//   };
// }, []);

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <SocketProvider>
//         <>
//           <Navbar />
//           <GlobalSnackbar />
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

//             {/* Protected Routes */}
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/update-password" element={<UpdatePassword />} />
//             <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
//             <Route path="/friendships" element={<FriendRequestsPage />} />
//             <Route path="/update-user/:id" element={<UpdateUserById />} />
//             <Route path="/user-table" element={<UserTable />} />

//             {/* Notifications */}
                    
// <Route path="/notifications" element={<NotificationPage />} />
// <Route path="/mark-as-read" element={<NotificationPage />} />

// {/* <Route path="/notifications" element={<NotificationPanel />} />
// <Route path="/mark-as-read" element={<NotificationPanel />} /> */}

//             {/* Chat Routes */}
//             <Route path="/chat" element={<Chat />} />
//             <Route path="/chat/:chatId" element={<Chat />} />

//             {/* 404 */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//           <Footer />
//         </>
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;




