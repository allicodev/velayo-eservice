import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ItemBranchState } from "@/types";

const initialState: ItemBranchState[] = [];

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    newItem: (state, action: PayloadAction<ItemBranchState>) => {
      state.push(action.payload);
      return state;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      return state.filter((e) => e.name != action.payload);
    },
    purgeItems: (state) => {
      state = [];
      return state;
    },
  },
});

export const { newItem, removeItem, purgeItems } = itemSlice.actions;
export default itemSlice.reducer;
