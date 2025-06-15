import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { fetchCartItems } from '../../features/cart/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Map from '../MAP/map';
import PaypalButtons from './PaypalButtons';
import ShippingAddress from '../ShippingAddress/ShippingAddress';
import axios from 'axios';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import CheckoutOrderItemsList from '../CheckoutOrderItemsList/CheckoutOrderItemsList';

const PaymentPage = () => {
  const dispatch = useDispatch();
  const { profile, isLoading: userLoading } = useSelector(
    (state) => state.user
  );
  const {
    items: orderItems = [],
    isLoading: cartLoading,
    error,
  } = useSelector((state) => state.cart);

  const [selectedPosition, setSelectedPosition] = useState([51.505, -0.09]);
  const [autoLocationLoading, setAutoLocationLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        await dispatch(fetchCartItems());
      } catch (err) {
        dispatch(
          showSnackbar({
            message: err.message || 'Failed to load cart items.',
            severity: 'error',
          })
        );
      }
    };
    fetchItems();
  }, [dispatch]);

  useEffect(() => {
    if (profile?.user?.address) {
      const fetchLocation = async () => {
        setAutoLocationLoading(true);
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search`,
            {
              params: { q: profile.user.address, format: 'json' },
            }
          );
          if (response.data?.length > 0) {
            const { lat, lon } = response.data[0];
            setSelectedPosition([parseFloat(lat), parseFloat(lon)]);
            dispatch(
              showSnackbar({
                message: 'Location identified from your address.',
                severity: 'success',
              })
            );
          } else throw new Error('Unable to find location from your address.');
        } catch (error) {
          console.error(error);
          dispatch(
            showSnackbar({
              message: `Error fetching location: ${
                error.response?.data?.message ||
                error.message ||
                'Unknown error'
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
  }, [profile, dispatch]);

  useEffect(() => {
    if (orderItems.length > 0) {
      const existingOrderId = orderItems[0]?.orderId;
      setOrderId(existingOrderId || null);
    }
  }, [orderItems]);

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item?.Product?.price || 0) * (item?.quantity || 0),
    0
  );

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

  if (!profile) {
    return (
      <Typography variant="h6" textAlign="center" sx={{ mt: 4 }}>
        Please log in to proceed with the payment.
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" textAlign="center" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  if (orderItems.length === 0) {
    return (
      <Typography variant="h6" textAlign="center" sx={{ mt: 4 }}>
        Your cart is empty. Add items to proceed with the payment.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, mt: 6 }}
      >
        Payment Page
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
              totalAmount={totalAmount}
            />
            <Divider sx={{ my: 2 }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Payment Options
          </Typography>
          <PaypalButtons
            order={{
              id: orderId,
              totalPrice: totalAmount,
              items: orderItems.map((item) => ({
                name: item.Product?.name,
                price: item.Product?.price,
                quantity: item.quantity,
              })),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Map
            initialPosition={selectedPosition}
            onPositionChange={setSelectedPosition}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage;
