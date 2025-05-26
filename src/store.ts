// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { leaveApi } from './services/leavesService';

const store = configureStore({
  reducer: {
    [leaveApi.reducerPath]: leaveApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(leaveApi.middleware),
});

export default store;
