import { configureStore } from "@reduxjs/toolkit";

const appReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;