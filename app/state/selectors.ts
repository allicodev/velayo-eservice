import { RootState } from "./store";

export const getCurrentBranch = (state: RootState) =>
  state.branch.currentBranch;
