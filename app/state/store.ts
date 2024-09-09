import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "./counterSlice";
import branchItemReducer from "./itemSlice";
import tellerReducer from "./teller.reducer";
import logsReducers from "./logs.reducers";
import branchReducer from "./branch.reducer";

export const store = configureStore({
  reducer: {
    item: counterReducer,
    branchItem: branchItemReducer,
    teller: tellerReducer,
    logs: logsReducers,
    branch: branchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
