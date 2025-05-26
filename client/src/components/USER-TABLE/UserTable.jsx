// src/components/User/UserTable.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Public as PublicIcon
} from '@mui/icons-material';

import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import SearchBar from '../SearchBar/SearchBar';
import { fetchAllUsers } from '../../features/user/userSlice';
import { sendFriendRequest } from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const USERS_PER_PAGE = 10;

const UserTable = ({ mode = 'admin' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    users = [],
    status,
    error,
    totalPages,
    currentUser,
    friendRequests = []
  } = useSelector((state) => state.user || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const onSearchChange = useCallback(
    debounce((val) => {
      setPage(1);
      setSearchTerm(val);
    }, 300),
    []
  );

  useEffect(() => {
    dispatch(fetchAllUsers({
      search: searchTerm,
      page,
      limit: USERS_PER_PAGE,
      excludeCurrent: mode !== 'admin'
    }));
  }, [dispatch, searchTerm, page, mode]);

  const handleSendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest({ userId: currentUser.id, friendId: userId })).unwrap();
      dispatch(showSnackbar({ message: 'Friend request sent', severity: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: 'error' }));
    }
  };

  const getPrivacyIcon = (visibility) => {
    switch (visibility) {
      case 'public': return <PublicIcon color="success" />;
      case 'friends': return <PersonIcon color="info" />;
      case 'private': return <LockIcon color="warning" />;
      default: return <PublicIcon />;
    }
  };

  const getFriendStatus = (userId) => {
    if (userId === currentUser?.id) return 'You';
    const req = friendRequests.find(r =>
      ((r.userId === currentUser.id && r.friendId === userId) ||
       (r.userId === userId && r.friendId === currentUser.id)) &&
      r.status === 'pending'
    );
    if (req) {
      return req.userId === currentUser.id ? 'Request Sent' : 'Respond';
    }
    return 'Add Friend';
  };

  return (
    <Box sx={{ pt: 6, mt: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SearchBar value={searchTerm} onChange={onSearchChange} />

      <Paper elevation={2}>
        <TableContainer sx={{ position: 'relative', minHeight: 500 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.paper' }}>
                <TableCell>Profile</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                {mode === 'admin' && <TableCell>Email</TableCell>}
                {mode === 'admin' && <TableCell>Admin</TableCell>}
                {mode === 'admin' && <TableCell>Banned</TableCell>}
                <TableCell>Privacy</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell><Avatar src={u.profileImage} sx={{ width: 48, height: 48 }} /></TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{u.firstName} {u.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary">@{u.username || `user${u.id}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={u.isOnline ? 'Online' : 'Offline'} color={u.isOnline ? 'success' : 'default'} size="small" />
                    </TableCell>
                    {mode === 'admin' && <TableCell>{u.email}</TableCell>}
                    {mode === 'admin' && <TableCell>{u.isAdmin ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</TableCell>}
                    {mode === 'admin' && <TableCell>{u.isBanned ? <CheckCircleIcon color="error" /> : <CancelIcon color="success" />}</TableCell>}
                    <TableCell>
                      <Tooltip title={u.privacySettings?.profileVisibility || 'public'}>
                        {getPrivacyIcon(u.privacySettings?.profileVisibility)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {mode === 'admin' ? (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit User">
                            <IconButton onClick={() => navigate(`/admin/users/${u.id}`)}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton><MoreVertIcon /></IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Button
                          variant="outlined"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleSendRequest(u.id)}
                          disabled={getFriendStatus(u.id) !== 'Add Friend'}
                          size="small"
                          sx={{ textTransform: 'none', minWidth: '140px' }}
                        >
                          {getFriendStatus(u.id)}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={mode === 'admin' ? 8 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'No matching users found' : 'No users available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {status === 'loading' && (
            <Box
              sx={{
                position: 'absolute',
                top: 64,
                left: 0,
                width: '100%',
                height: 'calc(100% - 64px)',
                backgroundColor: 'rgba(255,255,255,0.6)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              shape="rounded"
              showFirstButton
              showLastButton
              sx={{ '& .MuiPaginationItem-root': { fontSize: '0.875rem' } }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserTable;














































