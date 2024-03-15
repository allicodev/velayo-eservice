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

export type WalletFeeType = "percent" | "fixed";
export interface Wallet {
  _id?: string;
  name: string;
  feeType?: WalletFeeType;
  feeValue?: number | null;
}

//* transaction types

export type TransactionType = "gcash" | "eload" | string;
export type TransactionHistoryStatus = "completed" | "failed" | "pending";

export interface TransactionHistory {
  description: string;
  status: TransactionHistoryStatus;
  dateCreated?: Date;
}
export interface Transaction {
  _id?: string;
  type: TransactionType;
  sub_type?: string;
  // for gcash (pre-defined already)
  gcash?: Gcash;
  bill?: string; // json entry for all bill inputs
  history: TransactionHistory[];
  reference?: string;
  dateCreated: Date;
}

export interface Gcash {
  type: "cash-in" | "cash-out";
  name: string;
  number: string;
  amount: number;
  fee: number;
  dateCreated?: Date;
}
