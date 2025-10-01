
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import dataReducer from './dataSlice';
import flightsReducer from './flightsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    data: dataReducer,
    flights: flightsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;