import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  cancelOrder,
  fetchOrdersByStatus,
} from '../../features/order/orderSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
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
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const OrderTable = () => {
  const dispatch = useDispatch();
  const {
    orders = [], // Default to an empty array to avoid undefined issues
    isLoading,
    error,
    currentPage = 1, // Default to 1
    totalPages = 1, // Default to 1
  } = useSelector((state) => state.order);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 5;

  // Fetch orders on component mount and when dependencies change
  useEffect(() => {
    dispatch(
      fetchOrdersByStatus({ search, page: currentPage, limit: ordersPerPage })
    );
  }, [dispatch, search, currentPage]);

  // Handle order cancellation
  const handleCancel = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Order canceled successfully',
          severity: 'success',
        })
      );
      dispatch(
        fetchOrdersByStatus({ search, page: currentPage, limit: ordersPerPage })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: `Error canceling order: ${error.message}`,
          severity: 'error',
        })
      );
    } finally {
      handleClose();
    }
  };

  // Open dialog for confirmation
  const handleClickOpen = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  // Handle page change in pagination
  const handlePageChange = (event, value) => {
    dispatch(
      fetchOrdersByStatus({ search, page: value, limit: ordersPerPage })
    );
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Typography variant="h6" color="error" align="center" mt={3}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search by ID or Status"
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
                  <TableCell>Status</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total (€)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {order.items
                          ? `${order.items.length} item(s)`
                          : 'No items'}
                      </TableCell>
                      <TableCell>
                        €{order.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            sx={{ color: '#4caf50' }}
                            onClick={() =>
                              console.log('View order details', order.id)
                            }
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {order.status === 'PENDING' && (
                            <IconButton
                              sx={{ color: '#f44336' }}
                              onClick={() => handleClickOpen(order)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No orders found.
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
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order: {selectedOrder?.id}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleCancel(selectedOrder.id)}
            sx={{ color: '#f44336' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderTable;
