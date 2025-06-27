// src/App.jsx
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { store } from './app/store';
import { SocketProvider } from './context/SocketContext';
import { startLoading, stopLoading } from './features/loading/loadingSlice'; // ✅ Import loading
import { showSnackbar } from './features/snackbar/snackbarSlice';
import { logoutUser, selectIsAuthenticated } from './features/user/userSlice';
import socketService from './utils/socket';

// UI & layout
import SocketFriendshipHandler from './components/Friends/SocketFriendshipHandler';
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
import FriendsList from './components/PROFILE/PrivateProfile/FriendsListCard';
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

  // Handle socket connection
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
    return () => socketService.disconnect();
  }, [isAuthenticated]);

  // ✅ Logout with centralized loading (wave + dot-dot-dot)
  const handleLogout = async () => {
    const {
      user: { profile },
    } = store.getState();

    const displayName = `${profile?.firstName || ''} ${
      profile?.lastName || ''
    }`.trim();
    const avatarUrl = profile?.profileImage || '/default-avatar.png';

    dispatch(
      startLoading({ message: 'Logging out...', animationType: 'wave' })
    );

    try {
      await dispatch(logoutUser()).unwrap();
      // dispatch(resetAuthState());

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

      // ✅ Delay so loading is visible before navigating away
      setTimeout(() => {
        dispatch(stopLoading());
        navigate('/login');
      }, 3000); // adjust if needed
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(
        showSnackbar({
          message: 'Logout failed. Please try again.',
          severity: 'error',
          duration: 8000,
        })
      );
      dispatch(stopLoading());
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SocketProvider>
        <SocketFriendshipHandler />
        <Navbar onLogout={handleLogout} />
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
          <Route path="/friends" element={<FriendsList />} />
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

