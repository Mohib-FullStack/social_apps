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
import SocketFriendshipHandler from './components/Friends/SocketFriendshipHandler';
import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
import UserTable from './components/USER-TABLE/UserTable';
import { SocketProvider } from './context/SocketContext';
import LoadingOverlay from './features/loading/LoadingOverlay';
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar/Navbar';
import socketService from './utils/socket';


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
            <LoadingOverlay /> {/* ✅ Add this line here */}
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

               {/* <Route path="/friends/requests" element={<FriendRequestsPage />} /> */}
    {/* <Route path="/friends" element={<FriendRequestsPage />} /> */}
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







