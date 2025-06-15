import { PhotoCamera } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../../features/category/categorySlice';
import {
  fetchProducts,
  updateProduct,
} from '../../features/product/productSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const UpdateProduct = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [files, setFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // For controlling snackbar messages

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
    dispatch(fetchCategories());
  }, [dispatch, products.length]);

  useEffect(() => {
    const productToUpdate = products.find((prod) => prod.slug === slug);
    if (productToUpdate) {
      setName(productToUpdate.name);
      setDescription(productToUpdate.description);
      setPrice(productToUpdate.price);
      setQuantity(productToUpdate.quantity);
      setShippingCost(productToUpdate.shippingCost);
      setImagePreview(productToUpdate.images || []);
    }
  }, [products, slug]);

  useEffect(() => {
    if (status === 'success') {
      dispatch(
        showSnackbar({
          message: 'Product updated successfully!',
          severity: 'success',
        })
      );
      setTimeout(() => navigate('/product-table'), 1500); // Navigate after showing snackbar
    } else if (status === 'error') {
      dispatch(
        showSnackbar({
          message: 'Failed to update product. Please try again.',
          severity: 'error',
        })
      );
    }
  }, [status, dispatch, navigate]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    const previewImages = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreview((prevImages) => [...prevImages, ...previewImages]);
  };

  const handleImageRemove = (index) => {
    const imageToDelete = imagePreview[index];
    setDeletedImages((prev) => [...prev, imageToDelete]);
    setImagePreview((prevImages) => prevImages.filter((_, i) => i !== index));
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('shippingCost', shippingCost);
    files.forEach((file) => formData.append('images', file));
    formData.append('deletedImages', JSON.stringify(deletedImages));
  
    try {
      const result = await dispatch(updateProduct({ slug, data: formData })).unwrap();
      
      if (result.message === 'Product updated successfully') {
        dispatch(showSnackbar({ message: result.message, severity: 'success' }));
        setTimeout(() => navigate('/product-table'), 1500);
      } else {
        dispatch(showSnackbar({ message: result.message || 'Update failed.', severity: 'error' }));
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to update product.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Card sx={{ width: 600, borderRadius: 3, boxShadow: 3, p: 3 }}>
        <Typography variant="h5" color="secondary" align="center" gutterBottom>
          Update Product
        </Typography>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>Current Images:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  {imagePreview.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Avatar
                        src={image}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Button
                        onClick={() => handleImageRemove(index)}
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                      >
                        ❌
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="upload-button"
                />
                <label htmlFor="upload-button">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                  >
                    Upload Images
                  </Button>
                </label>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Product'}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(-1)}
                  fullWidth
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UpdateProduct;










