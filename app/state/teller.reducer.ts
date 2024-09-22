import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TellerState, User } from "@/types";
import { UpdateBalance } from "./redux.types";

const initialState: TellerState | null = {};

const branchSlice = createSlice({
  name: "teller",
  initialState,
  reducers: {
    setTeller: (state, action: PayloadAction<User>) => {
      state = action.payload;
      return state;
    },
    setBalance: (state, action: PayloadAction<UpdateBalance>) => {
      const { balance } = action.payload;

      if (state) state.balance = balance;
      else throw new Error("No branch to set the balance");

      return state;
    },
    updateBalance: (state, action: PayloadAction<UpdateBalance>) => {
      const { balance } = action.payload;

      if (typeof state.balance == "number") state.balance += balance;
      else throw new Error("No branch to set the balance");

      return state;
    },
  },
});

export const { setTeller, setBalance, updateBalance } = branchSlice.actions;
export default branchSlice.reducer;
