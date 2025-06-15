import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation

const ThankYouPage = ({ order }) => {
  const navigate = useNavigate();

  // Show loading spinner if order is not yet loaded
  if (!order) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
          Loading order details...
        </Typography>
      </Box>
    );
  }

  // Handle cases where products might be undefined
  const products = order.products || [];
  const orderTotal = products.reduce(
    (total, product) => total + (product.price || 0),
    0
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        padding: 4,
      }}
    >
      {/* Main Content */}
      <Grid container spacing={4} alignItems="center">
        {/* Image Section */}
        <Grid item xs={12} md={6}>
          <Avatar
            alt="Thank you for your order"
            src="/checkout-thank-you.jpg" // Ensure this image is in your public folder
            sx={{
              width: { xs: 200, md: 400 },
              height: { xs: 200, md: 400 },
              margin: '0 auto',
            }}
          />
        </Grid>

        {/* Text Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom color="primary">
            Thanks for your order!
          </Typography>
          {order._isPaid ? (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your order was successfully processed. We’ve sent your receipt and
              order details to{' '}
              <strong>{order.user?.email || 'your email'}</strong>.
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your order is being processed. We’ll send you a confirmation soon!
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Order Details */}
          <Typography variant="h6">Order Summary</Typography>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              marginTop: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Order ID: {order.id || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items:
            </Typography>
            <ul>
              {products.length > 0 ? (
                products.map((product) => (
                  <li
                    key={product.id || Math.random()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Avatar
                      alt={product.name || 'Product Image'}
                      src={product.image || '/placeholder.jpg'} // Provide a fallback image
                      sx={{ width: 50, height: 50, marginRight: 2 }}
                    />
                    <Typography variant="body2">
                      {product.name || 'Unnamed Product'} - $
                      {product.price?.toFixed(2) || '0.00'}
                    </Typography>
                  </li>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No products in this order.
                </Typography>
              )}
            </ul>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ fontWeight: 'bold' }}
            >
              Total: ${orderTotal.toFixed(2)}
            </Typography>
          </Paper>

          {/* Buttons */}
          <Box sx={{ marginTop: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/products')}
              sx={{ marginRight: 2 }}
            >
              Continue Shopping
            </Button>
            {order.isPaid && (
              <Button
                variant="outlined"
                color="secondary"
                href="/download-receipt" // Replace with actual download link
              >
                Download Receipt
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThankYouPage;
