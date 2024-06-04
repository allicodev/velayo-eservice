import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ItemState } from "@/types";

const initialState: ItemState[] = [];

const counterSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    newItem: (state, action: PayloadAction<ItemState>) => {
      state.push(action.payload);
      return state;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      return state.filter((e) => e._id != action.payload);
    },
    purgeItems: (state) => {
      state = [];
      return state;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      return state.map((e) => {
        if (e._id == action.payload.id)
          return { ...e, quantity: action.payload.quantity };
        return e;
      });
    },
    incrementQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      return state.map((e) => {
        if (e._id == action.payload.id)
          return { ...e, quantity: e.quantity + action.payload.quantity };
        return e;
      });
    },
  },
});

export const {
  newItem,
  removeItem,
  updateQuantity,
  purgeItems,
  incrementQuantity,
} = counterSlice.actions;
export default counterSlice.reducer;
