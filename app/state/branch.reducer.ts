import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Branch, BranchData, BranchState } from "@/types";
import { UpdateBalance } from "./redux.types";

const initialState: BranchState = {};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranch: (state, action: PayloadAction<BranchData>) => {
      state.currentBranch = action.payload;
      return state;
    },
  },
});

export const { setBranch } = branchSlice.actions;
export default branchSlice.reducer;
