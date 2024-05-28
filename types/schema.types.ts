import {
  BillingSettingsType,
  BillingsFormField,
  ExceptionItemProps,
} from "./billings.types";

export type RoleType = "teller" | "encoder" | "accounting" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
  employeeId?: string;
}

export interface ProtectedUser {
  _id?: string;
  name: string;
  email: string;
  username: string;
  role: RoleType;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithToken extends ProtectedUser {
  token: string;
}

//* transaction types
export type TransactionType =
  | "bills"
  | "wallet"
  | "eload"
  | "miscellaneous"
  | "shopee";
export type TransactionHistoryStatus = "completed" | "failed" | "pending";

export interface TransactionHistory {
  description: string;
  status: TransactionHistoryStatus;
  createdAt: Date;
}
export interface Transaction {
  _id?: string;
  type: TransactionType;
  tellerId: User | string;
  billerId?: string | null;
  walletId?: string | null;
  encoderId?: string | null;
  branchId: Branch | string;
  sub_type?: string;
  transactionDetails: string;
  reference?: string;
  history: TransactionHistory[];
  createdAt?: Date;
  amount?: number;
  fee?: number;
  traceId?: string; // for ewallet cashout
  isOnlinePayment?: boolean;
  portal?: string;
  receiverName?: string;
  recieverNum?: string;
}

export interface TransactionPOS extends Transaction {
  cash: number;
}

export interface OnlinePayment {
  isOnlinePayment: boolean;
  portal: string;
  receiverName: string;
  recieverNum: string;
  traceId: string;
  reference?: string;
}

export type WalletType = "cash-in" | "cash-out";
export type FeeType = "percent" | "fixed";

export interface Wallet {
  _id?: string;
  name: string;
  cashinType: FeeType;
  cashinFeeValue: number | null;
  cashoutType: FeeType;
  cashoutFeeValue: number | null;
  cashInFormField: BillingsFormField[];
  cashOutFormField: BillingsFormField[];
  cashInexceptFormField?: ExceptionItemProps[];
  cashOutexceptFormField?: ExceptionItemProps[];
  isDisabled?: boolean;
}

export interface Fee {
  type: FeeType;
  fee: number | null;
}

export interface AccountingTableProps {
  ref: string; // Ref Code
  branch: string; //Branch Name
  createdAt: Date; //Date/Time
  type: TransactionType; //Transaction Type
  billerName: string; //Biller Name / Product Code
  amount: number; //Amount
  fee: number; // Service Fee
  amFee: number; //Amount + Service Fee
  teller: string; //User
  status: TransactionHistoryStatus; //Status
}

export type ItemUnit = "pc(s)" | "bot(s)" | "kit(s)";

//* Items
export interface Item {
  name: string;
  isParent: boolean;
  parentId: string;
  sub_categories?: Item[] | ItemData[];
  itemCode: number;
  unit: ItemUnit | undefined;
  price: number;
  quantity: number;
  cost: number;
}

export interface ItemData extends Item {
  _id: string;
  parentName?: string;
}

// * Branch
export interface Branch {
  name?: string;
  address: string;
  device: string;
  spm: string;
}

export interface BranchData extends Branch {
  _id?: string;
  createdAt?: Date;
}

// * Log
export type LogType = "attendance" | "stock" | "credit" | "debit";
export type LogBalanceType = "bills" | "wallet" | "eload";
export interface Log {
  type: LogType;
  userId: User;
  branchId: Branch;

  // for attendance
  timeIn?: Date;
  timeOut?: Date;
  timeInPhoto?: string;
  timeOutPhoto?: string;

  createdAt?: Date;
}

export interface LogBalance extends Pick<Log, "type" | "userId" | "createdAt"> {
  amount: number; // for credit, kay pwede ma kuhaon sa transaction.amount ang amount sa debit
  balanceType: LogBalanceType; // for credit
  status: "pending" | "completed"; // for credit

  transactionId: Transaction; // for debit, if encoder approve the teller transact request
}

export interface LogData extends Log {
  _id: string;
  createdAt?: Date;
}

// notification
export interface Notification {
  _id?: string;
  from: User | string;
  description: string;
  isRead?: Boolean;
  extra?: Record<any, any>;
  createdAt?: Date;
}
