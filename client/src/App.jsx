// src/App.jsx
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { store } from './app/store';
import { SocketProvider } from './context/SocketContext';
import { showSnackbar } from './features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  logoutUser,
  refreshAccessToken,
  resetAuthState,
  selectAuthChecked,
  selectIsAuthenticated,
  setAuthChecked,
} from './features/user/userSlice';
import socketService from './utils/socket';

// UI & layout
import SocketFriendshipHandler from './components/Friends/SocketFriendshipHandler';
import LoadingBar from './features/loading/LoadingBar'; // Added LoadingBar import
import LoadingOverlay from './features/loading/LoadingOverlay';
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar/Navbar';

// Pages
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

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authChecked = useSelector(selectAuthChecked);

  // Check auth status on app load or refresh
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
      } catch (_) {
        try {
          const refreshResult = await dispatch(refreshAccessToken()).unwrap();
          if (refreshResult?.user) {
            await dispatch(fetchUserProfile()).unwrap();
          } else {
            dispatch(resetAuthState());
          }
        } catch (refreshError) {
          console.error('Auth check failed:', refreshError);
          dispatch(resetAuthState());
        }
      } finally {
        dispatch(setAuthChecked(true));
      }
    };

    if (!authChecked) verifyAuth();
  }, [dispatch, authChecked]);

  // Handle socket connection
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
    return () => socketService.disconnect();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const {
        user: { profile },
      } = store.getState();
      const displayName = `${profile?.firstName || ''} ${
        profile?.lastName || ''
      }`.trim();
      const avatarUrl = profile?.profileImage || '/default-avatar.png';

      await dispatch(logoutUser()).unwrap();
      dispatch(resetAuthState());

      dispatch(
        showSnackbar({
          message: `Goodbye, ${
            displayName.split(' ')[0]
          }! 👋 Hope to see you soon.`,
          severity: 'success',
          duration: 8000,
          username: displayName,
          avatarUrl,
        })
      );

      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(
        showSnackbar({
          message: 'Logout failed. Please try again.',
          severity: 'error',
          duration: 8000,
        })
      );
    }
  };

  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <LoadingOverlay />
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SocketProvider>
        <SocketFriendshipHandler />
        <Navbar onLogout={handleLogout} />
        <LoadingBar /> {/* Added LoadingBar component */}
        <GlobalSnackbar />
        <LoadingOverlay />
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
      </SocketProvider>
    </LocalizationProvider>
  );
};

export default App;


//! original
// // src/App.jsx
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Route, Routes, useNavigate } from 'react-router-dom';
// import { store } from './app/store';
// import { SocketProvider } from './context/SocketContext';
// import { showSnackbar } from './features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   refreshAccessToken,
//   resetAuthState,
//   selectAuthChecked,
//   selectIsAuthenticated,
//   setAuthChecked,
// } from './features/user/userSlice';
// import socketService from './utils/socket';

// // UI & layout
// import SocketFriendshipHandler from './components/Friends/SocketFriendshipHandler';
// import LoadingOverlay from './features/loading/LoadingOverlay';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar/Navbar';

// // Pages
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

// const App = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const authChecked = useSelector(selectAuthChecked);

//   // Check auth status on app load or refresh
//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         await dispatch(fetchUserProfile()).unwrap();
//       } catch (_) {
//         try {
//           const refreshResult = await dispatch(refreshAccessToken()).unwrap();
//           if (refreshResult?.user) {
//             await dispatch(fetchUserProfile()).unwrap();
//           } else {
//             dispatch(resetAuthState());
//           }
//         } catch (refreshError) {
//           console.error('Auth check failed:', refreshError);
//           dispatch(resetAuthState());
//         }
//       } finally {
//         dispatch(setAuthChecked(true));
//       }
//     };

//     if (!authChecked) verifyAuth();
//   }, [dispatch, authChecked]);

//   // Handle socket connection
//   useEffect(() => {
//     if (isAuthenticated) {
//       socketService.connect();
//     } else {
//       socketService.disconnect();
//     }
//     return () => socketService.disconnect();
//   }, [isAuthenticated]);

//   // ✅ Logout with avatar + name in snackbar
//   //? this is also fine
//   // const handleLogout = async () => {
//   //   try {
//   //     const { user: { profile } } = store.getState();
//   //     const username = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
//   //     const avatarUrl = profile?.profileImage || '/default-avatar.png';

//   //     await dispatch(logoutUser()).unwrap();
//   //     dispatch(resetAuthState());

//   //     dispatch(
//   //       showSnackbar({
//   //         message: 'You have been logged out successfully',
//   //         severity: 'success',
//   //         duration: 8000,
//   //         username,
//   //         avatarUrl,
//   //       })
//   //     );

//   //    navigate('/login');
//   //   } catch (err) {
//   //     console.error('Logout error:', err);
//   //     dispatch(
//   //       showSnackbar({
//   //         message: 'Logout failed. Please try again.',
//   //         severity: 'error',
//   //         duration: 8000,
//   //       })
//   //     );
//   //   }
//   // };

//   const handleLogout = async () => {
//     try {
//       const {
//         user: { profile },
//       } = store.getState();
//       const displayName = `${profile?.firstName || ''} ${
//         profile?.lastName || ''
//       }`.trim();
//       const avatarUrl = profile?.profileImage || '/default-avatar.png';

//       await dispatch(logoutUser()).unwrap();
//       dispatch(resetAuthState());

//       dispatch(
//         showSnackbar({
//           message: `Goodbye, ${
//             displayName.split(' ')[0]
//           }! 👋 Hope to see you soon.`,
//           severity: 'success',
//           duration: 8000,
//           username: displayName,
//           avatarUrl,
//         })
//       );

//       navigate('/login');
//     } catch (err) {
//       console.error('Logout error:', err);
//       dispatch(
//         showSnackbar({
//           message: 'Logout failed. Please try again.',
//           severity: 'error',
//           duration: 8000,
//         })
//       );
//     }
//   };

//   if (!authChecked) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//         }}
//       >
//         <LoadingOverlay />
//       </div>
//     );
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <SocketProvider>
//         <SocketFriendshipHandler />
//         <Navbar onLogout={handleLogout} />
//         <GlobalSnackbar />
//         <LoadingOverlay />
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/activate" element={<ActivatePage />} />
//           <Route path="/contact-us" element={<ContactUs />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/profile/me" element={<PrivateProfilePage />} />
//           <Route path="/profile/:id" element={<PublicProfilePage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/update-password" element={<UpdatePassword />} />
//           <Route path="/my-profile-update" element={<PrivateProfileUpdate />} />
//           <Route path="/friendships" element={<FriendRequestsPage />} />
//           <Route path="/update-user/:id" element={<UpdateUserById />} />
//           <Route path="/user-table" element={<UserTable />} />
//           <Route path="/chat" element={<Chat />} />
//           <Route path="/chat/:chatId" element={<Chat />} />
          

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         <Footer />
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;
