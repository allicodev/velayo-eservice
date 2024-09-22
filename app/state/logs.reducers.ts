import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { NewLog, ReduxLogs, SetLogs } from "./redux.types";

const initialState: ReduxLogs = { cash: [] };

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<SetLogs>) => {
      const { key } = action.payload;
      state[key] = action.payload.logs;
      return state;
    },

    newLog: (state, action: PayloadAction<NewLog>) => {
      const { log, key } = action.payload;
      state[key].unshift(log);
      return state;
    },
  },
});

export const { setLogs, newLog } = logSlice.actions;
export default logSlice.reducer;
