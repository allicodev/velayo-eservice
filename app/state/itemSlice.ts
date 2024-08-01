import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ItemData } from "@/types";

const initialState: ItemData[] = [];

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    newItem: (state, action: PayloadAction<ItemData>) => {
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
