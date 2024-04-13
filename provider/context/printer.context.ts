import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";
import { Printer } from "@/types";

type PrinterStore = {
  printer: Printer | null;
  setPrinter: (printer: any) => void;
  removePrinter: () => void;
  updatePid: (str: string | null) => void;
  updateStatus: (bool: boolean) => void;
};

type MyPersist = (
  config: StateCreator<PrinterStore>,
  options: PersistOptions<PrinterStore>
) => StateCreator<PrinterStore>;

const usePrinterStore = create<PrinterStore, []>(
  (persist as MyPersist)(
    (set, get): PrinterStore => ({
      printer: null,
      setPrinter: (printer: Printer) => set(() => ({ printer })),
      removePrinter: () => set({ printer: null }),
      updatePid: (val: string | null) =>
        set((state) => ({
          printer: {
            pid: val,
            connected: state.printer?.connected ?? false,
          },
        })),
      updateStatus: (bool: boolean) =>
        set((state) => ({
          printer: {
            pid: state.printer?.pid ?? null,
            connected: bool,
          },
        })),
    }),
    {
      name: "printer",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { usePrinterStore };
