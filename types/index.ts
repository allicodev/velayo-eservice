import { UserProps } from "./props.types";
import { ItemUnit, Transaction } from "./schema.types";

type TransactionHistoryDataType_type = "pending" | "completed" | "failed";
type TransactionNameType = "gcash" | "eload" | "bills";
type UserBadgeTitle = "Teller" | "Encoder";

interface TransactionHistoryDataType {
  id: number;
  key: number | string;
  name: TransactionNameType;
  type: string | null;
  dateCreated: Date;
  reference?: string | null;
  amount?: number;
  accountNumber?: string;
  accountName?: string;
  mobileNumber?: string;
  history?: HistoryDataType[];
}

interface HistoryDataType {
  date: Date;
  description: String;
  status: TransactionHistoryDataType_type;
}

interface BillsStateDataType {
  open: boolean;
  transaction: TransactionHistoryDataType | null;
}

interface NewUser
  extends Pick<UserProps, "name" | "email" | "username" | "role"> {
  password: string;
}

interface BillsSettings {
  open: boolean;
  close: () => void;
}

//* E-Wallet types

type EWalletTypes = "percent" | "fixed";
interface EWalletDataType {
  name: string;
  type: EWalletTypes;
  value: number;
}

// api interface
interface Response {
  code: number;
  success: boolean;
  message?: string;
}

interface ExtendedResponse<T> extends Response {
  data?: T;
  meta?: {
    total: number;
  };
}

// pagination props

interface PageProps {
  pageSize: number;
  page: number;
  total?: number;
  role?: string;
  searchKey?: string;
}

export type {
  TransactionHistoryDataType,
  TransactionHistoryDataType_type,
  BillsStateDataType,
  NewUser,
  BillsSettings,
  EWalletDataType,
  EWalletTypes,
  UserBadgeTitle,
  Response,
  ExtendedResponse,
  PageProps,
};

export * from "./billings.types";
export * from "./schema.types";
export * from "./props.types";
export * from "./service.types";

// utils
export interface TransactionOptProps {
  open: boolean;
  transaction: Transaction | null;
}

export interface ItemCode {
  value: number;
}

export interface ItemState {
  _id?: string;
  name: string;
  itemCode: number;
  unit: ItemUnit;
  currentQuantity: number;
  quantity: number;
  parentName: string;
  price: number;
}
