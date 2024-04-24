import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";
import { User } from "@/types";

type UserStore = {
  currentUser: User | null;
  setUser: (user: any) => void;
  removeUser: () => void;
  currentBranch: string;
  setBranch: (string: string) => void;
  removeBranch: () => void;
};

type MyPersist = (
  config: StateCreator<UserStore>,
  options: PersistOptions<UserStore>
) => StateCreator<UserStore>;

const useUserStore = create<UserStore, []>(
  (persist as MyPersist)(
    (set, get): UserStore => ({
      currentUser: null,
      setUser: (user: User) => set(() => ({ currentUser: user })),
      removeUser: () => set({ currentUser: null }),
      currentBranch: "",
      setBranch: (branch: string) => set(() => ({ currentBranch: branch })),
      removeBranch: () => set({ currentBranch: "" }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useUserStore };
