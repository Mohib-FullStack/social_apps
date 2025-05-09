import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCartItems } from '../../features/cart/cartSlice';
import { createOrder } from '../../features/order/orderSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import CheckoutOrderItemsList from '../CheckoutOrderItemsList/CheckoutOrderItemsList';
import Map from '../MAP/map';
import ShippingAddress from '../ShippingAddress/ShippingAddress';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, isLoading: userLoading } = useSelector(
    (state) => state.user
  );
  const { items: orderItems = [], isLoading: cartLoading } = useSelector(
    (state) => state.cart
  );

  const [selectedPosition, setSelectedPosition] = useState([51.505, -0.09]); // Default position
  const [selectedAddress, setSelectedAddress] = useState('');
  const [autoLocationLoading, setAutoLocationLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  // Fetch cart items on load
  useEffect(() => {
    dispatch(fetchCartItems()).catch((err) =>
      dispatch(
        showSnackbar({
          message: err.message || 'Failed to load cart items.',
          severity: 'error',
        })
      )
    );
  }, [dispatch]);

  // Detect address and location based on user profile
  useEffect(() => {
    if (profile?.user?.address) {
      const fetchLocation = async () => {
        setAutoLocationLoading(true);
        try {
          const response = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
              params: { q: profile.user.address, format: 'json' },
            }
          );

          if (response.data?.length > 0) {
            const { lat, lon, display_name } = response.data[0];
            setSelectedPosition([parseFloat(lat), parseFloat(lon)]);
            setSelectedAddress(display_name);
            dispatch(
              showSnackbar({
                message: 'Address found and location set.',
                severity: 'success',
              })
            );
          } else {
            dispatch(
              showSnackbar({
                message: 'Address not found. Using default location.',
                severity: 'warning',
              })
            );
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          dispatch(
            showSnackbar({
              message: 'Error detecting location.',
              severity: 'error',
            })
          );
        } finally {
          setAutoLocationLoading(false);
        }
      };

      fetchLocation();
    }
  }, [profile, dispatch]);

  // Handle position change from Map
  const handlePositionChange = async (position) => {
    setSelectedPosition(position);
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: { lat: position[0], lon: position[1], format: 'json' },
        }
      );

      if (response.data?.display_name) {
        setSelectedAddress(response.data.display_name);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleOrderSubmit = async () => {
    try {
      const orderData = {
        userId: profile?.user?.id,
        shippingAddress: selectedAddress || profile?.user?.address,
        items: orderItems.map((item) => ({
          productId: item.productId,
          productName: item.Product?.name,
          quantity: item.quantity,
          price: item.Product?.price,
        })),
        totalPrice: orderItems.reduce(
          (sum, item) =>
            sum + (item.Product?.price || 0) * (item.quantity || 0),
          0
        ),
      };

      if (
        !orderData.items.every(
          (item) =>
            item.productId &&
            item.productName &&
            item.quantity > 0 &&
            item.price >= 0
        )
      ) {
        dispatch(
          showSnackbar({
            message:
              'One or more items in your cart are invalid. Please review your order.',
            severity: 'error',
          })
        );
        return;
      }

      const resultAction = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(resultAction)) {
        const createdOrderId = resultAction.payload.id; // Assuming backend returns `id`
        dispatch(
          showSnackbar({
            message: 'Order placed successfully! Redirecting to payment...',
            severity: 'success',
          })
        );
        setTimeout(
          () => navigate('/payment', { state: { orderId: createdOrderId } }),
          1500
        );
      } else {
        dispatch(
          showSnackbar({
            message:
              resultAction.payload ||
              'Failed to place order. Please try again.',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      console.error('Error in order submission:', error);
      dispatch(
        showSnackbar({
          message: 'An unexpected error occurred. Please try again later.',
          severity: 'error',
        })
      );
    }
  };

  if (userLoading || cartLoading || autoLocationLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, mt: 6 }}
      >
        Checkout Page
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              padding: 3,
              border: '3px solid',
              borderRadius: 2,
              borderImageSource: 'linear-gradient(to right, #f36, #4af)',
              borderImageSlice: 1,
            }}
          >
            <ShippingAddress address={profile?.user?.address} />
            <CheckoutOrderItemsList
              orderItems={orderItems}
              totalAmount={orderItems.reduce(
                (sum, item) =>
                  sum + (item.Product?.price || 0) * (item.quantity || 0),
                0
              )}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleOrderSubmit}
              sx={{
                mt: 2,
                background: 'linear-gradient(90deg, #65e9ff, #ff7eb3)',
                color: '#fff',
              }}
              disabled={orderItems.length === 0}
            >
              Place Order & Go to Payment
            </Button>

            {orderStatus && (
              <Typography variant="h6" sx={{ mt: 3 }}>
                Order Status: {orderStatus}
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Map
            initialPosition={selectedPosition}
            onPositionChange={handlePositionChange}
            address={profile?.user?.address}
          />
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={`Selected Address: ${selectedAddress}`}
      />
    </Box>
  );
};

export default CheckoutPage;


