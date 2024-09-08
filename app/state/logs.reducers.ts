import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { NewLog, ReduxLogs, SetLogs } from "./redux.types";

const initialState: ReduxLogs = { cash: [] };

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<SetLogs>) => {
      const { cb, logs, key } = action.payload;
      state[key] = action.payload.logs;

      if (cb != null) cb(true, logs);
      return state;
    },

    newLog: (state, action: PayloadAction<NewLog>) => {
      const { cb, log, key } = action.payload;
      state[key].unshift(log);

      if (cb != null) cb(true, log);

      return state;
    },
  },
});

export const { setLogs, newLog } = logSlice.actions;
export default logSlice.reducer;
