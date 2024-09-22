import { TableProps as ATableProps } from "antd";
import Excel from "exceljs";
import { Log, TransactionOptProps } from "@/types";

export type UpdateType = "add" | "deduct";

export interface TableProps {
  columns: ATableProps<Log>["columns"];
}

export interface CashboxFormProps
  extends ManualCashUpdateHandler,
    UpdateCashFormProp {
  close: () => void;
}

export interface CashBoxProps {
  open: boolean;
  close: () => void;
  setTransactionOpt: React.Dispatch<React.SetStateAction<TransactionOptProps>>;
}

export interface ManualCashUpdateHandler {
  data: ManualCashBoxUpdateProp;
  onManualCashUpdate: (key: string, value: any) => void;
  updateBalance: () => Promise<void>;
}

export interface ManualCashBoxUpdateProp {
  cash: number | null;
  reason: string | null;
  cashFrom: string | null;
}

export interface UpdateCashFormProp {
  open: boolean;
  updateType: UpdateType | null;
}
