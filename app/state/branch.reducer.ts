import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Branch, BranchData, BranchState } from "@/types";
import { UpdateBalance } from "./redux.types";

const initialState: BranchState = {};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranch: (
      state,
      action: PayloadAction<{
        branch: BranchData;
      }>
    ) => {
      state.currentBranch = action.payload.branch;

      return state;
    },
    setBalance: (state, action: PayloadAction<UpdateBalance>) => {
      const { balance, cb } = action.payload;

      if (state.currentBranch) state.currentBranch.balance = balance;
      else throw new Error("No branch to set the balance");

      if (cb != null) cb(true);

      return state;
    },
    updateBalance: (state, action: PayloadAction<UpdateBalance>) => {
      const { balance, cb } = action.payload;

      if (state.currentBranch) state.currentBranch.balance += balance;
      else throw new Error("No branch to set the balance");

      if (cb != null) cb(true);

      return state;
    },
  },
});

export const { setBranch, setBalance, updateBalance } = branchSlice.actions;
export default branchSlice.reducer;
