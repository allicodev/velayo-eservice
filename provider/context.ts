import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";
import { User, ItemData } from "@/types";
import { Dayjs } from "dayjs";

type AuthStore = {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
};

type MyPersistAuth = (
  config: StateCreator<AuthStore>,
  options: PersistOptions<AuthStore>
) => StateCreator<AuthStore>;

const useAuthStore = create<AuthStore, []>(
  (persist as MyPersistAuth)(
    (set, get): AuthStore => ({
      accessToken: null,
      setAccessToken: (token: string) =>
        set((state) => ({ accessToken: token })),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

type UserStore = {
  currentUser: User | null;
  setUser: (user: any) => void;
  removeUser: () => void;
  currentBranch: string;
  setBranch: (string: string) => void;
  removeBranch: () => void;
};

type MyPersistUser = (
  config: StateCreator<UserStore>,
  options: PersistOptions<UserStore>
) => StateCreator<UserStore>;

const useUserStore = create<UserStore, []>(
  (persist as MyPersistUser)(
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

type ItemStore = {
  items: ItemData[];
  setItems: (token: ItemData[]) => void;
  lastDateUpdated: Dayjs | null;
  setLastDateUpdated: (token: Dayjs) => void;
  clearItems: () => void;
};

type MyPersistItem = (
  config: StateCreator<ItemStore>,
  options: PersistOptions<ItemStore>
) => StateCreator<ItemStore>;

const useItemStore = create<ItemStore, []>(
  (persist as MyPersistItem)(
    (set, get): ItemStore => ({
      items: [],
      setItems: (token: ItemData[]) => set((state) => ({ items: token })),
      lastDateUpdated: null,
      setLastDateUpdated: (token: Dayjs) =>
        set((state) => ({ lastDateUpdated: token })),
      clearItems: () => set(() => ({ items: [] })),
    }),
    {
      name: "items",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAuthStore, useUserStore, useItemStore };
