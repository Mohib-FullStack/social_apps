import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteUser, fetchAllUsers } from '../../features/user/userSlice'
import { showSnackbar } from '../../features/snackbar/snackbarSlice'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Pagination,
  CircularProgress,
  Avatar,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const UserTable = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // const {
  //   user = [],
  //   status,
  //   error,
  //   currentPage,
  //   totalPages,
  //   isAdmin,
  // } = useSelector((state) => state.user);

  const {
    user = [],
    status,
    error,
    currentPage,
    totalPages,
    isAdmin,
  } = useSelector((state) => state.user || {})

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const usersPerPage = 5

  useEffect(() => {
    dispatch(fetchAllUsers({ search, page: currentPage, limit: usersPerPage }))
  }, [dispatch, search, currentPage])

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
      dispatch(
        showSnackbar({
          message: 'User deleted successfully',
          severity: 'success',
        })
      )
      dispatch(
        fetchAllUsers({ search, page: currentPage, limit: usersPerPage })
      )
    } catch (error) {
      dispatch(
        showSnackbar({
          message: `Error deleting user: ${error.message}`,
          severity: 'error',
        })
      )
    } finally {
      handleClose()
    }
  }

  const handleClickOpen = (user) => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedUser(null)
  }

  const handlePageChange = (event, value) => {
    dispatch(fetchAllUsers({ search, page: value, limit: usersPerPage }))
  }

  const handleEdit = (id) => {
    console.log('Admin status before navigating to edit:', isAdmin)
    navigate(`/update-user/${id}`)
  }

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (status === 'failed') {
    return (
      <Typography variant="h6" color="error" align="center" mt={3}>
        {error}
      </Typography>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search by Name, Email, or Phone"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Banned</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {Array.isArray(user) && user.length > 0 ? (
                  user.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Avatar
                          src={user.image}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      </TableCell>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{user.isBanned ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            sx={{ color: '#4caf50' }}
                            onClick={() => handleEdit(user.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            sx={{ color: '#f44336' }}
                            onClick={() => handleClickOpen(user)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              color="secondary"
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user: {selectedUser?.firstName}{' '}
            {selectedUser?.lastName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(selectedUser.id)}
            sx={{ color: '#f44336' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserTable
