import { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  Box,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory } from '../../features/category/categorySlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import global snackbar
import { useNavigate } from 'react-router-dom'; // Import navigate

const CreateCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate
  const { status, error } = useSelector((state) => state.category);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
    setNameError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Category name is required');
      return;
    }

    const resultAction = await dispatch(createCategory({ name }));
    if (createCategory.fulfilled.match(resultAction)) {
      setName(''); // Reset the input field
      dispatch(
        showSnackbar({
          message: 'Category created successfully!',
          severity: 'success',
        })
      );

      // Navigate to category table after a short delay
      setTimeout(() => {
        navigate('/category-table');
      }, 1500);
    } else {
      dispatch(
        showSnackbar({
          message: error || 'Failed to create category. Please try again.',
          severity: 'error',
        })
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Card
          sx={{
            width: 600,
            backgroundColor: 'background.paper',
            borderRadius: '20px',
            boxShadow: 3,
            textAlign: 'center',
            padding: 2,
            marginTop: 6,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <DialogTitle>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            >
              Create New Category
            </motion.div>
          </DialogTitle>

          <DialogContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                textAlign: 'center',
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Category Name"
                value={name}
                onChange={handleNameChange}
                error={!!nameError}
                helperText={nameError}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
              {status === 'loading' && <CircularProgress color="secondary" />}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button
              type="submit"
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Create Category
            </Button>
          </DialogActions>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default CreateCategory;




























