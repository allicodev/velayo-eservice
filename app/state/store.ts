import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import branchItemReducer from "./itemSlice";

export const store = configureStore({
  reducer: {
    item: counterReducer,
    branchItem: branchItemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
