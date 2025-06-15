// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   deleteCategory,
//   fetchCategories,
// } from '../../features/category/categorySlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { useNavigate } from 'react-router-dom';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   TextField,
//   Box,
//   Grid,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Button,
//   Pagination,
//   CircularProgress,
//   Typography,
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

// const CategoryTable = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { categories, status, error, currentPage, totalPages } = useSelector(
//     (state) => state.category
//   );
//   const [search, setSearch] = useState('');
//   const [open, setOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const categoriesPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   const handleDelete = async (slug) => {
//     try {
//       await dispatch(deleteCategory(slug)).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Category deleted successfully',
//           severity: 'success',
//         })
//       );
//       dispatch(fetchCategories());
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: `Error deleting category: ${error.message}`,
//           severity: 'error',
//         })
//       );
//     } finally {
//       handleClose();
//     }
//   };

//   const handleClickOpen = (category) => {
//     setSelectedCategory(category);
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedCategory(null);
//   };

//   const handlePageChange = (event, value) => {
//     dispatch(
//       fetchCategories({ search, page: value, limit: categoriesPerPage })
//     );
//   };

//   const handleEdit = (slug) => {
//     navigate(`/update-category/${slug}`);
//   };

//   if (status === 'loading') {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (status === 'failed') {
//     return (
//       <Typography variant="h6" color="error" align="center" mt={3}>
//         {error}
//       </Typography>
//     );
//   }

//   return (
//     <Box sx={{ mt: 3 }}>
//       <Grid container spacing={2}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Search by Name or Slug"
//             variant="outlined"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                 <TableCell>ID</TableCell>
//                   <TableCell>Name</TableCell>
//                   <TableCell>Slug</TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {categories.length > 0 ? (
//                   categories.map((category) => (
//                     <TableRow key={category.slug} hover>
//                       <TableCell>{category.id}</TableCell>
//                       <TableCell>{category.name}</TableCell>
//                       <TableCell>{category.slug}</TableCell>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           <IconButton
//                             sx={{ color: '#4caf50' }}
//                             onClick={() => handleEdit(category.slug)}
//                           >
//                             <EditIcon />
//                           </IconButton>
//                           <IconButton
//                             sx={{ color: '#f44336' }}
//                             onClick={() => handleClickOpen(category)}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={3} align="center">
//                       No categories found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//             <Pagination
//               count={totalPages}
//               color="secondary"
//               page={currentPage}
//               onChange={handlePageChange}
//             />
//           </Box>
//         </Grid>
//       </Grid>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Confirm Deletion</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete this category:{' '}
//             {selectedCategory?.name}?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={() => handleDelete(selectedCategory.slug)}
//             sx={{ color: '#f44336' }}
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default CategoryTable;
