import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Route, Routes } from 'react-router-dom';
import ActivatePage from './components/ACTIVATE/ActivatePage';
import Chat from './components/Chat/Chat';
import ContactUs from './components/CONTACT-US/ContactUs';
import Dashboard from './components/DASHBOARD/Dashboard';
import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
import HomePage from './components/HOME/Home';
import Login from './components/LOGIN/Login';
import NotFound from './components/NOTFOUND/NotFound';
import PrivateProfilePage from './components/PROFILE/PrivateProfilePage';
import PublicProfilePage from './components/PROFILE/PublicProfilePage';
// import UpdateUserProfile from './components/PROFILE/UpdateUserProfile';
import PrivateProfileUpdate from './components/PROFILE/PrivateProfileUpdate';
import PublicProfileUpdate from './components/PROFILE/PublicProfileUpdate';
import Register from './components/REGISTER/Register';
import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
import UserTable from './components/USER-TABLE/UserTable';
import { SocketProvider } from './context/SocketContext'; // Import the SocketProvider
import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
import Footer from './layouts/Footer';
import Navbar from './layouts/Navbar';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SocketProvider>
        {' '}
        {/* Wrap everything with SocketProvider */}
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
            <Route path="/profile/private" element={<PrivateProfilePage />} />
            <Route path="/profile/public/:id" element={<PublicProfilePage />} />
            <Route path="/profile/public/me" element={<PublicProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route
              path="/private-profile-update"
              element={<PrivateProfileUpdate />}
            />

              <Route
              path="/public-profile-update"
              element={<PublicProfileUpdate />}
            />
            <Route path="/update-user/:id" element={<UpdateUserById />} />
            <Route path="/user-table" element={<UserTable />} />

            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:chatId" element={<Chat />} />

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

//! test with wraper
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Route, Routes } from 'react-router-dom';
// import ActivatePage from './components/ACTIVATE/ActivatePage';
// import ContactUs from './components/CONTACT-US/ContactUs';
// import Dashboard from './components/DASHBOARD/Dashboard';
// import ForgotPassword from './components/FORGOT-PASSWORD/ForgotPassword';
// import HomePage from './components/HOME/Home';
// import Login from './components/LOGIN/Login';
// import NotFound from './components/NOTFOUND/NotFound';
// import Profile from './components/PROFILE/Profile';
// import UpdateUserProfile from './components/PROFILE/UpdateUserProfile';
// import Register from './components/REGISTER/Register';
// import ResetPassword from './components/RESET-PASSWORD/ResetPassword';
// import UpdatePassword from './components/UPDATE-PASSWORD/UpdatePassword';
// import UpdateUserById from './components/UPDATE-USER-BY-ID/UpdateUserById';
// import UserTable from './components/USER-TABLE/UserTable';
// import { SocketProvider } from './context/SocketContext';
// import GlobalSnackbar from './features/snackbar/GlobalSnackbar';
// import Footer from './layouts/Footer';
// import Navbar from './layouts/Navbar';
// import Chat from './components/Chat/Chat';
// import LayoutWrapper from './layouts/LayoutWrapper'; // <-- NEW

// const App = () => {
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

//             {/* Protected/User-Specific Routes */}
//             <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
//             <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
//             <Route path="/update-password" element={<LayoutWrapper><UpdatePassword /></LayoutWrapper>} />
//             <Route path="/update-user-profile" element={<LayoutWrapper><UpdateUserProfile /></LayoutWrapper>} />
//             <Route path="/update-user/:id" element={<LayoutWrapper><UpdateUserById /></LayoutWrapper>} />
//             <Route path="/user-table" element={<LayoutWrapper><UserTable /></LayoutWrapper>} />

//             {/* Chat Routes with Layout */}
//             <Route path="/chat" element={<LayoutWrapper><Chat /></LayoutWrapper>} />
//             <Route path="/chat/:chatId" element={<LayoutWrapper><Chat /></LayoutWrapper>} />

//             {/* 404 - Not Found */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>

//           <Footer />
//         </>
//       </SocketProvider>
//     </LocalizationProvider>
//   );
// };

// export default App;
