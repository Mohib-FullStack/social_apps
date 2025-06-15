import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { addToCart } from '../../features/cart/cartSlice';
import { fetchProductBySlug } from '../../features/product/productSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import showSnackbar

// Enhanced Image Carousel Component with 3D Effect
const ImageCarousel = ({ images = [] }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    customPaging: () => (
      <div
        style={{
          backgroundColor: '#3f51b5',
          opacity: 0.9,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          margin: '0 4px',
          transition: 'background-color 0.3s',
        }}
      />
    ),
    appendDots: (dots) => (
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 0',
        }}
      >
        <ul style={{ display: 'flex', gap: '12px' }}>{dots}</ul>
      </div>
    ),
  };

  return images.length ? (
    <Slider {...settings}>
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: { xs: '300px', sm: '400px', md: '500px' },
            overflow: 'hidden',
            borderRadius: '8px',
            backgroundColor: '#e0f7fa',
            perspective: '1000px',
          }}
        >
          <Box
            sx={{
              transform: 'rotateY(0deg)',
              transition: 'transform 0.6s ease-in-out',
              '&:hover': {
                transform: 'rotateY(15deg) scale(1.02)',
              },
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={image}
              alt={`Product Image ${index + 1}`}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                transform: 'scale(1) rotateY(0deg)',
              }}
            />
          </Box>
        </Box>
      ))}
    </Slider>
  ) : (
    <Typography variant="h6" color="text.secondary" align="center">
      No images available.
    </Typography>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.product);
  const [selectedImage, setSelectedImage] = useState(null); // Track the selected image to enlarge

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [dispatch, slug]);

  const handleAddToCart = () => {
    if (!product.slug) {
      dispatch(showSnackbar({ message: 'Product slug is missing!', severity: 'error' }));
      return;
    }
    const cartItem = {
      productSlug: product.slug, // Match backend casing
      userSlug: 'user1234', // Replace with dynamic user info
      quantity: 1,
    };

    dispatch(addToCart(cartItem))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'Added to cart successfully!', severity: 'success' }));
      })
      .catch(() => {
        dispatch(showSnackbar({ message: 'Failed to add to cart.', severity: 'error' }));
      });
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image); // Enlarge the selected image
  };

  const closeEnlargedImage = () => {
    setSelectedImage(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 8 }}>
      {loading ? (
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
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          Failed to load product details.
        </Typography>
      ) : (
        product && (
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <ImageCarousel images={product.images || []} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  mb: 4,
                }}
              >
                <CardContent>
                  <Typography variant="h4" component="div" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    €{product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                  <Chip label={product.category} color="primary" sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Available: {product.stock} in stock
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>

              <Grid container spacing={2}>
                {product.images?.map((image, index) => (
                  <Grid item xs={4} sm={3} key={index}>
                    <Card
                      sx={{
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          transition: 'transform 0.3s ease',
                        },
                      }}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Product Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {selectedImage && (
                <Box sx={{ mt: 4, position: 'relative' }}>
                  <IconButton
                    onClick={closeEnlargedImage}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1,
                      color: 'red', // Close icon color
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: White background for better contrast
                      '&:hover': {
                        backgroundColor: 'rgba(255, 0, 0, 0.1)', // Subtle red hover effect
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      transform: 'scale(1.05)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Enlarged Product Image"
                      style={{
                        maxWidth: '80%',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        )
      )}
    </Container>
  );
};

export default ProductDetails;










