// import DeleteIcon from '@mui/icons-material/Delete'
// import {
//   Avatar,
//   Box,
//   Button,
//   CircularProgress,
//   Divider,
//   IconButton,
//   MenuItem,
//   Select,
//   Typography,
// } from '@mui/material'
// import { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import {
//   fetchCartItems,
//   removeFromCart,
//   updateCartItemQuantity,
// } from '../../features/cart/cartSlice'
// import { showSnackbar } from '../../features/snackbar/snackbarSlice'

// const CartPage = () => {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()

//   const { items = [], isLoading, error } = useSelector((state) => state.cart)

//   // Calculate total price and total count
//   const totalPrice = items.reduce(
//     (sum, item) => sum + (item.Product?.price || 0) * (item.quantity || 0),
//     0
//   )
//   const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)

//   useEffect(() => {
//     dispatch(fetchCartItems())
//       .unwrap()
//       .catch((err) =>
//         dispatch(
//           showSnackbar({
//             message: err.message || 'Failed to fetch cart items.',
//             severity: 'error',
//           })
//         )
//       )
//   }, [dispatch])

//   const handleQuantityChange = (productSlug, newQuantity) => {
//     console.log("Updating cart item:", productSlug, newQuantity); // Verify productSlug and quantity
//     dispatch(updateCartItemQuantity({ productSlug, quantity: newQuantity }));
//   };

//   const handleRemoveItem = (cartItemId) => {
//     dispatch(removeFromCart(cartItemId))
//       .unwrap()
//       .then(() =>
//         dispatch(
//           showSnackbar({
//             message: 'Item removed from cart!',
//             severity: 'success',
//           })
//         )
//       )
//       .catch((err) =>
//         dispatch(
//           showSnackbar({
//             message: err.message || 'Failed to remove item from cart.',
//             severity: 'error',
//           })
//         )
//       )
//   }

//   const handleCheckout = () => {
//     navigate('/checkout')
//   }

//   const handleGoToProducts = () => {
//     navigate('/product-display')
//   }

//   if (isLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
//         <CircularProgress />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Typography variant="h6" color="error" align="center" mt={3}>
//         {error}
//       </Typography>
//     )
//   }

//   return (
//     <Box sx={{ padding: 3 }}>
//       <Typography
//         variant="h4"
//         sx={{ mb: 3, mt: 6, fontWeight: 'bold', textAlign: 'center' }}
//       >
//         Cart Page
//       </Typography>

//       {items.length > 0 ? (
//         <Box sx={{ display: 'flex', gap: 4 }}>
//           <Box sx={{ flex: 2 }}>
//             {items.map((item) => (
//               <Box
//                 key={item.id}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 2,
//                   padding: 2,
//                   border: '3px solid',
//                   borderRadius: 2,
//                   marginBottom: 2,
//                   borderImageSource: 'linear-gradient(45deg, #f36, #4af)',
//                   borderImageSlice: 1,
//                 }}
//               >
//                 <Avatar
//                   src={item.Product?.images?.[0]}
//                   alt={item.Product?.name || 'Product Image'}
//                   sx={{ width: 60, height: 60 }}
//                 />
//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="h6">
//                     {item.Product?.name || 'Unknown'}
//                   </Typography>
//                 </Box>
//                 <Select
//                   value={item.quantity || 0}
//                   onChange={(e) =>
//                     handleQuantityChange(item.Product?.slug, parseInt(e.target.value, 10)) // Correctly using the product's slug here
//                   }
//                   sx={{
//                     minWidth: 60,
//                     '& .MuiOutlinedInput-notchedOutline': {
//                       borderColor: 'transparent',
//                     },
//                   }}
//                   disabled={item.Product?.quantity === 0}
//                 >
//                   {[...Array(10).keys()].map((qty) => (
//                     <MenuItem key={qty + 1} value={qty + 1}>
//                       {qty + 1}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 <Typography sx={{ minWidth: 100, textAlign: 'right' }}>
//                   €
//                   {((item.Product?.price || 0) * (item.quantity || 0)).toFixed(
//                     2
//                   )}
//                 </Typography>
//                 <IconButton
//                   color="error"
//                   onClick={() => handleRemoveItem(item.id)}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </Box>
//             ))}
//           </Box>
//           <Box
//             sx={{
//               flex: 1,
//               padding: 2,
//               border: '3px solid',
//               borderRadius: 2,
//               borderImageSource: 'linear-gradient(to right, #ff7eb3, #65e9ff)',
//               borderImageSlice: 1,
//               height: 'fit-content',
//             }}
//           >
//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Summary
//             </Typography>
//             <Divider sx={{ mb: 2 }} />
//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Total Items: {totalCount}
//             </Typography>
//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Total Price: €{totalPrice.toFixed(2)}
//             </Typography>
//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               onClick={handleCheckout}
//               sx={{
//                 mt: 2,
//                 background: 'linear-gradient(90deg, #ff7eb3, #65e9ff)',
//                 color: '#fff',
//                 '&:hover': {
//                   background: 'linear-gradient(90deg, #65e9ff, #ff7eb3)',
//                 },
//               }}
//             >
//               Proceed to Checkout
//             </Button>
//           </Box>
//         </Box>
//       ) : (
//         <Box
//           sx={{
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             mt: 5,
//           }}
//         >
//           <img
//             src="./hippo-empty-cart.png"
//             alt="Empty cart illustration"
//             style={{ maxWidth: '250px', marginBottom: '20px' }}
//           />
//           <Typography variant="h6" sx={{ mb: 1 }}>
//             Your cart is empty
//           </Typography>
//           <Button
//             onClick={handleGoToProducts}
//             variant="contained"
//             color="primary"
//             sx={{
//               background: 'linear-gradient(90deg, #65e9ff, #ff7eb3)',
//               color: '#fff',
//               '&:hover': {
//                 background: 'linear-gradient(90deg, #ff7eb3, #65e9ff)',
//               },
//             }}
//           >
//             Add items to your cart
//           </Button>
//         </Box>
//       )}
//     </Box>
//   )
// }

// export default CartPage




























