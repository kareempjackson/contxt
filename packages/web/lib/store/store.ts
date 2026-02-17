import { configureStore } from '@reduxjs/toolkit';
import { contxtApi } from './api';
import panelReducer from './panel-slice';

export const store = configureStore({
  reducer: {
    [contxtApi.reducerPath]: contxtApi.reducer,
    panel: panelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(contxtApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
