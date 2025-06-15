/* =============================
   File: src/layouts/Navbar/ProfileAvatar.jsx
   ============================= */
import React from 'react';
import { Avatar, IconButton } from '@mui/material';
import { motion } from 'framer-motion';

const ProfileAvatar = ({ src, onClick }) => (
  <motion.div whileTap={{ scale: 0.9 }}>
    <IconButton onClick={onClick} sx={{ p: 0 }}>
      <Avatar src={src} sx={{ width: 36, height: 36 }} />
    </IconButton>
  </motion.div>
);

export default ProfileAvatar;
