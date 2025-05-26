/* =============================
   File: src/routes/ProtectedRoute.jsx
   ============================= */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ redirectTo = '/login' }) => {
  const { loggedIn } = useSelector(state => state.user);
  return loggedIn ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;









// import { useSelector, useDispatch } from 'react-redux';
// import { Navigate } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import CircularProgress from '@mui/material/CircularProgress';
// import { useEffect } from 'react';
// import { fetchUserProfile } from '../features/user/userSlice'; // Make sure this is imported correctly

// const ProtectedRoute = ({ children }) => {
//   const dispatch = useDispatch();
//   const { user, status } = useSelector((state) => state.user);

//   useEffect(() => {
//     if (status === 'idle') {
//       dispatch(fetchUserProfile()); // Dispatch fetchUserProfile if status is idle
//     }
//   }, [status, dispatch]);

//   // Show loading spinner while fetching user profile
//   if (status === 'loading' || status === 'idle') {
//     return <CircularProgress />;
//   }

//   // Handle potential error if status indicates failure
//   if (status === 'failed') {
//     return <p>Failed to load user profile. Please try again.</p>;
//   }

//   // Check if user is authenticated
//   return status === 'succeeded' && user ? children : <Navigate to="/login" />;
// };

// ProtectedRoute.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export default ProtectedRoute;
