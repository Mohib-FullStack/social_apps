// app/store.js
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import snackbarReducer from '../features/snackbar/snackbarSlice'
import categoryReducer from '../features/category/categorySlice'
import productReducer from '../features/product/productSlice' // Import product reducer
import cartReducer from '../features/cart/cartSlice'
import orderReducer from '../features/order/orderSlice';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Persist user data only
}

const persistedUserReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    snackbar: snackbarReducer,
    category: categoryReducer,
    product: productReducer, 
    cart: cartReducer,
    order: orderReducer, 
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)





