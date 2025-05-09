import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../features/category/categorySlice';
import {
  clearError,
  clearSuccessMessage,
  createProduct,
} from '../../features/product/productSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import global snackbar
import theme from '../../theme';

const CreateProduct = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state.category);
  const { loading, successMessage, error } = useSelector(
    (state) => state.product
  );

  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const validFiles = acceptedFiles.filter(
         (file) => file.size <= 10 * 1024 * 1024 // 10MB file size limit
              
      );
      if (validFiles.length < acceptedFiles.length) {
        dispatch(
          showSnackbar({
            message: 'Some files exceeded the 10MB limit and were not added.',
            severity: 'warning',
          })
        );
      }
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    if (successMessage) {
      dispatch(
        showSnackbar({
          message: successMessage,
          severity: 'success',
        })
      );
      setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate('/dashboard');
      }, 2000);
    }
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, navigate, successMessage, error]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity);
    formData.append('shippingCost', data.shippingCost);
    formData.append('categoryId', data.categoryId);
    formData.append('variants', data.variants);

    files.forEach((file) => {
      formData.append('images', file);
    });

    dispatch(createProduct(formData))
      .unwrap()
      .then(() => {
        dispatch(
          showSnackbar({
            message: 'Product created successfully!',
            severity: 'success',
          })
        );
        reset();
        setFiles([]);
      })
      .catch((error) => {
        dispatch(
          showSnackbar({
            message: error.message || 'Failed to create product.',
            severity: 'error',
          })
        );
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100vh',
          backgroundColor: 'background.default',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            padding: 4,
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 4,
            transition: 'transform 0.3s ease',
            marginTop: '100px',
            '&:hover': { transform: 'scale(1.02)' },
          }}
        >
          <Typography
            variant="h5"
            color="secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Create New Product
          </Typography>

          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Product name is required',
                  minLength: {
                    value: 3,
                    message: 'Must be at least 3 characters',
                  },
                  maxLength: {
                    value: 150,
                    message: 'Cannot exceed 150 characters',
                  },
                }}
                render={({ field }) => (
                  <Tooltip title="Enter a unique product name">
                    <TextField
                      {...field}
                      label="Product Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={!!errors.name}
                      helperText={errors.name ? errors.name.message : ''}
                    />
                  </Tooltip>
                )}
              />
   <Controller
                name="description"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Description is required',
                  minLength: {
                    value: 3,
                    message: 'Must be at least 3 characters',
                  },
                }}
                render={({ field }) => (
                  <Tooltip title="Describe the product in detail">
                    <TextField
                      {...field}
                      label="Description"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={
                        errors.description ? errors.description.message : ''
                      }
                    />
                  </Tooltip>
                )}
              />
              <Controller



                name="price"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                }}
                render={({ field }) => (
                  <Tooltip title="Set a reasonable price for the product">
                    <TextField
                      {...field}
                      label="Price"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="number"
                      error={!!errors.price}
                      helperText={errors.price ? errors.price.message : ''}
                    />
                  </Tooltip>
                )}
              />
              <Controller
                name="quantity"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    error={!!errors.quantity}
                    helperText={errors.quantity ? errors.quantity.message : ''}
                  />
                )}
              />
              <Controller
                name="shippingCost"
                control={control}
                defaultValue={0}
                rules={{
                  required: 'Shipping cost is required',
                  min: {
                    value: 0,
                    message: 'Shipping cost cannot be negative',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Shipping Cost"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    error={!!errors.shippingCost}
                    helperText={
                      errors.shippingCost ? errors.shippingCost.message : ''
                    }
                  />
                )}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Controller
                  name="categoryId"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="category-label"
                      label="Category"
                      error={!!errors.categoryId}
                    >
                      {categories?.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <Typography variant="caption" color="error">
                    {errors.categoryId.message}
                  </Typography>
                )}
              </FormControl>
              <Controller
                name="variants"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Product Variants (e.g., Small, Medium, Large)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                )}
              />


              {/* Other input fields remain unchanged */}
              <div
                {...getRootProps({ className: 'dropzone' })}
                style={{
                  border: '2px dashed gray',
                  padding: '20px',
                  textAlign: 'center',
                  marginTop: '20px',
                  width: '100%',
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drop images here, or click to select (max 10)
                </Typography>
                {files.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
                    {files.map((file, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Avatar
                          src={URL.createObjectURL(file)}
                          alt="Selected Image"
                          sx={{ width: 100, height: 100, margin: '5px' }}
                        />
                        <Button
                          onClick={() =>
                            setFiles(files.filter((_, i) => i !== index))
                          }
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            color: 'error.main',
                          }}
                        >
                          ❌
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </div>
              {loading && <CircularProgress color="secondary" sx={{ mt: 2 }} />}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                Create Product
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default CreateProduct;









