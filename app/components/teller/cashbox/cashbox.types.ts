import { TableProps as ATableProps } from "antd";
import { Log, TransactionOptProps } from "@/types";

export type UpdateType = "add" | "deduct";

export interface TableProps {
  columns: ATableProps<Log>["columns"];
  updateBalance: (_: UpdateType, __: number) => Promise<void>;
}

export interface CashboxFormProps {
  open: boolean;
  close: () => void;
  updateType: UpdateType | null;
  updateBalance: (_: UpdateType, __: number) => Promise<void>;
}

export interface CashBoxProps {
  open: boolean;
  close: () => void;
  setTransactionOpt: React.Dispatch<React.SetStateAction<TransactionOptProps>>;
}
