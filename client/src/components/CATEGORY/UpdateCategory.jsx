// import {
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
// } from '@mui/material'
// import { ThemeProvider } from '@mui/material/styles'
// import { motion } from 'framer-motion'
// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate, useParams } from 'react-router-dom'
// import {
//   fetchCategories,
//   updateCategory,
// } from '../../features/category/categorySlice'
// import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import global snackbar
// import theme from '../../theme'

// const UpdateCategory = () => {
//   const { slug } = useParams()
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const categories = useSelector((state) => state.category.categories)
//   const [name, setName] = useState('')
//   const [loading, setLoading] = useState(false)

//   // Fetch category data on mount
//   useEffect(() => {
//     dispatch(fetchCategories())
//   }, [dispatch])

//   // Find the category to update
//   useEffect(() => {
//     const categoryToUpdate = categories.find((cat) => cat.slug === slug)
//     if (categoryToUpdate) {
//       setName(categoryToUpdate.name)
//     }
//   }, [categories, slug])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!name) return

//     setLoading(true)
//     try {
//       await dispatch(updateCategory({ slug, name })).unwrap()

//       // Use global snackbar
//       dispatch(
//         showSnackbar({
//           message: 'Category updated successfully!',
//           severity: 'success',
//         })
//       )

//       // Redirect after successful update
//       navigate('/category-table')
//     } catch (error) {
//       // Use global snackbar for error
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to update category.',
//           severity: 'error',
//         })
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           backgroundColor: 'background.default',
//         }}
//       >
//         <Card
//           sx={{
//             width: 600,
//             backgroundColor: 'background.paper',
//             borderRadius: '20px',
//             boxShadow: 3,
//             textAlign: 'center',
//             padding: 2,
//             marginTop: 6,
//             transition: 'transform 0.3s ease',
//             '&:hover': {
//               transform: 'scale(1.05)',
//             },
//           }}
//         >
//           <DialogTitle>
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.5 }}
//               style={{ textAlign: 'center', fontWeight: 'bold' }}
//             >
//               Update Category
//             </motion.div>
//           </DialogTitle>

//           <DialogContent>
//             <Box
//               component="form"
//               onSubmit={handleSubmit}
//               sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: 2,
//                 textAlign: 'center',
//               }}
//             >
//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 label="Category Name"
//                 type="text"
//                 required
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 sx={{
//                   '& .MuiInputBase-root': { borderRadius: '10px' },
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                   },
//                 }}
//               />
//               {loading && <CircularProgress color="secondary" />}
//             </Box>
//           </DialogContent>

//           <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
//             <Button
//               onClick={() => navigate('/category-table')}
//               color="error"
//               sx={{
//                 borderRadius: '10px',
//                 textTransform: 'capitalize',
//               }}
//             >
//               Back to Categories
//             </Button>

//             <Button
//               type="submit"
//               onClick={handleSubmit}
//               color="primary"
//               variant="contained"
//               sx={{
//                 borderRadius: '10px',
//                 textTransform: 'capitalize',
//                 '&:disabled': { backgroundColor: 'grey.400' },
//               }}
//               disabled={loading}
//             >
//               {loading ? (
//                 <CircularProgress size={24} color="inherit" />
//               ) : (
//                 'Submit'
//               )}
//             </Button>
//           </DialogActions>
//         </Card>
//       </Box>
//     </ThemeProvider>
//   )
// }

// export default UpdateCategory


