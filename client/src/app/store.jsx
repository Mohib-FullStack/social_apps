// app/store.js
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import snackbarReducer from '../features/snackbar/snackbarSlice'

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

  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)





