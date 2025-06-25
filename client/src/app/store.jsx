// app/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import friendshipReducer from '../features/friendship/friendshipSlice';
import loadingReducer from '../features/loading/loadingSlice'; // ✅ import
import messageReducer from '../features/messages/messageSlice';
import notificationReducer from '../features/notification/notificationSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice';
import userReducer from '../features/user/userSlice';


import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

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
    notifications: notificationReducer,
    message: messageReducer,
    loading: loadingReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)




//! original
// // app/store.jsx
// import { configureStore } from '@reduxjs/toolkit'
// import friendshipReducer from '../features/friendship/friendshipSlice'
// import snackbarReducer from '../features/snackbar/snackbarSlice'
// import userReducer from '../features/user/userSlice'
// import notificationReducer from '../features/notification/notificationSlice';

// import { persistReducer, persistStore } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['user'], // Persist user data only
// }

// const persistedUserReducer = persistReducer(persistConfig, userReducer)

// export const store = configureStore({
//   reducer: {
//     user: persistedUserReducer,
//     snackbar: snackbarReducer,
//     friendship: friendshipReducer,
//     notifications: notificationReducer,
  
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// })

// export const persistor = persistStore(store)





