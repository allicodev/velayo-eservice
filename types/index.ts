import { UserProps } from "./props.types";
import { ItemUnit, Transaction, User } from "./schema.types";

type TransactionHistoryDataType_type =
  | "request"
  | "pending"
  | "completed"
  | "failed";
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
  password?: string;
  employeeId?: string;
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
    [key: string]: any;
  };
}

// pagination props

interface PageProps {
  pageSize?: number;
  page?: number;
  _id?: string;
  total?: number;
  role?: string[] | undefined;
  searchKey?: string;
  [key: string]: any;
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
  requestId?: string | null;
}

export interface ItemCode {
  value: number;
}

// redux
export interface ItemState {
  _id?: string;
  name: string;
  itemCode: number;
  unit: ItemUnit;
  currentQuantity: number;
  quantity: number;
  parentName: string;
  price?: number;
  cost: number;
}

export interface ItemBranchState {
  _id?: string;
  name: string;
  itemCode: number;
  price: number;
}

export interface DashboardData {
  totalTransaction: number;
  totalTransactionToday: number;
  totalSales: number;
  totalNetSales: number;
  totalBranch: number;
  branchSales: BranchSales[];
  topItemSales: TopItem[];
  salesPerMonth: SalesPerMonth;
  salesPerType: any[];
}

export interface BranchSales {
  name: string;
  total: number;
  percentValue: string;
}

export interface TopItem {
  name: string;
  quantity: number;
}

export interface SalesPerMonth {
  Jan: number;
  Feb: number;
  Mar: number;
  Apr: number;
  May: number;
  Jun: number;
  Jul: number;
  Aug: number;
  Sep: number;
  Oct: number;
  Nov: number;
  Dec: number;
}

export interface TellerState extends Partial<User> {
  balance?: number;
}

export interface BranchState {
  currentBranch?: any;
}
