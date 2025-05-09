import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { trackOrder } from '../../features/order/orderSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import Map from '../MAP/map';
import ShippingAddress from '../ShippingAddress/ShippingAddress';
import OrderTrackItemsList from './OrderTrackItemsList';

const OrderTrackPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentOrder: order,
    isLoading: orderLoading,
    error,
  } = useSelector((state) => state.order);

  const [selectedPosition, setSelectedPosition] = useState([51.505, -0.09]); // Default location: London
  const [autoLocationLoading, setAutoLocationLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(trackOrder(orderId));
    } else {
      dispatch(
        showSnackbar({
          message: 'Order ID is missing!',
          severity: 'error',
        })
      );
      navigate('/');
    }
  }, [orderId, dispatch, navigate]);

  useEffect(() => {
    if (order?.shippingAddress) {
      const fetchLocation = async () => {
        setAutoLocationLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              order.shippingAddress
            )}&format=json`
          );
          const data = await response.json();
          if (data?.length > 0) {
            const { lat, lon } = data[0];
            setSelectedPosition([parseFloat(lat), parseFloat(lon)]);
            dispatch(
              showSnackbar({
                message: 'Location identified from shipping address.',
                severity: 'success',
              })
            );
          } else {
            throw new Error('Unable to locate the shipping address.');
          }
        } catch (error) {
          console.error(error);
          dispatch(
            showSnackbar({
              message: `Error fetching location: ${
                error.message || 'Unknown error'
              }`,
              severity: 'error',
            })
          );
        } finally {
          setAutoLocationLoading(false);
        }
      };
      fetchLocation();
    }
  }, [order, dispatch]);

  const totalAmount = order?.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  if (orderLoading || autoLocationLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/')}
        >
          Go back to the home page
        </Typography>
      </Box>
    );
  }

  if (!order || !order.id) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Order not found.
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/')}
        >
          Return to home page
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ minHeight: '100vh', p: 4, backgroundColor: 'background.default' }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Order #{order.id}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Status:</strong> {order.status}
        </Typography>
        {order.paymentId && (
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Payment ID:</strong> {order.paymentId}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ShippingAddress address={order.shippingAddress} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Map
              initialPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              readonly={true}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Items in Your Order
        </Typography>
        {order.items && order.items.length > 0 ? (
          <OrderTrackItemsList
            orderItems={order.items}
            totalAmount={totalAmount}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No items found in this order.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default OrderTrackPage;
