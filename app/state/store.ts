import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "./counterSlice";
import branchItemReducer from "./itemSlice";
import branchReducer from "./branch.reducer";
import logsReducers from "./logs.reducers";

export const store = configureStore({
  reducer: {
    item: counterReducer,
    branchItem: branchItemReducer,
    branch: branchReducer,
    logs: logsReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
