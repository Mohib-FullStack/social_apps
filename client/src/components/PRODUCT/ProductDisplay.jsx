import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../features/product/productSlice';

const ProductDisplay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products = [], loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleViewDetails = (product) => {
    navigate(`/product-details/${product.slug}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Product Showcase
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" mb={4}>
        Explore our latest products and view detailed information!
      </Typography>

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography variant="h6" color="error" align="center">
          Failed to load products. Please try again later.
        </Typography>
      )}

      <Grid container spacing={3}>
        {!loading && !error && products.length > 0 ? (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images?.[0] || '/placeholder.jpg'}
                  alt={`${product.name}-image`}
                  sx={{ objectFit: 'cover', flexShrink: 0, width: '100%' }}
                  onClick={() => handleViewDetails(product)}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    €{product.price.toFixed(2)}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleViewDetails(product)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          !loading && !error && (
            <Typography variant="h6" align="center" sx={{ width: '100%' }}>
              No products available.
            </Typography>
          )
        )}
      </Grid>

      <Box sx={{ mt: 4 }} />
    </Container>
  );
};

export default ProductDisplay;








