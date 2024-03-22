import { BillingsFormField } from "./billings.types";

export type RoleType = "teller" | "encoder";

export interface User {
  name: string;
  email: string;
  username: string;
  password: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtectedUser {
  name: string;
  email: string;
  username: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithToken extends ProtectedUser {
  token: string;
}

//* transaction types
export type TransactionType = "bills" | "wallet" | "eload";
export type TransactionHistoryStatus = "completed" | "failed" | "pending";

export interface TransactionHistory {
  description: string;
  status: TransactionHistoryStatus;
  dateCreated?: Date;
}
export interface Transaction {
  _id?: string;
  type: TransactionType;
  sub_type: string;
  transactionDetails: string;
  reference?: string;
  history: TransactionHistory[];
  createdAt?: Date;
  amount?: number;
  fee?: number;
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
  isDisabled?: boolean;
}

export interface Fee {
  type: FeeType;
  fee: number | null;
}
