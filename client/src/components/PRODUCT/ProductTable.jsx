import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteProduct,
  fetchProducts,
} from '../../features/product/productSlice'
import { showSnackbar } from '../../features/snackbar/snackbarSlice'
import { useNavigate } from 'react-router-dom'
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
  Avatar,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const ProductTable = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    products = [],
    loading,
    error,
    currentPage,
    totalPages,
  } = useSelector((state) => state.product)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const productsPerPage = 5

  useEffect(() => {
    dispatch(
      fetchProducts({ search, page: currentPage, limit: productsPerPage })
    )
  }, [dispatch, search, currentPage])

  const handleDelete = async (slug) => {
    try {
      await dispatch(deleteProduct(slug)).unwrap()
      dispatch(
        showSnackbar({
          message: 'Product deleted successfully',
          severity: 'success',
        })
      )
      dispatch(
        fetchProducts({ search, page: currentPage, limit: productsPerPage })
      )
    } catch (error) {
      dispatch(
        showSnackbar({
          message: `Error deleting product: ${error.message}`,
          severity: 'error',
        })
      )
    } finally {
      handleClose()
    }
  }

  const handleClickOpen = (product) => {
    setSelectedProduct(product)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedProduct(null)
  }

  const handlePageChange = (event, value) => {
    dispatch(fetchProducts({ search, page: value, limit: productsPerPage }))
  }

  const handleEdit = (slug) => {
    navigate(`/update-product/${slug}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center" mt={3}>
        {error}
      </Typography>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search by Name or Category"
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
                  <TableCell>Images</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Price (€)</TableCell> {/* Change to € */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(product.images || []).length > 0 ? (
                            product.images.map((image, index) => (
                              <Avatar
                                key={index}
                                src={image}
                                alt={product.name}
                                sx={{
                                  width: 50,
                                  height: 50,
                                }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No Images
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.categoryId}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.slug}</TableCell>
                      <TableCell>€{product.price.toFixed(2)}</TableCell>{' '}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            sx={{ color: '#4caf50' }}
                            onClick={() => handleEdit(product.slug)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            sx={{ color: '#f44336' }}
                            onClick={() => handleClickOpen(product)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No products found.
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
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product:{' '}
            {selectedProduct?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(selectedProduct.slug)}
            sx={{ color: '#f44336' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProductTable
