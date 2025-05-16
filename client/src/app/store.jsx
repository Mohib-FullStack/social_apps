// app/store.js
import { configureStore } from '@reduxjs/toolkit'
import friendshipReducer from '../features/friendship/friendshipSlice'
import snackbarReducer from '../features/snackbar/snackbarSlice'
import userReducer from '../features/user/userSlice'

import { persistReducer, persistStore } from 'redux-persist'
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
    friendship: friendshipReducer,
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)





