import {
  BillingSettingsType,
  BillingsFormField,
  ExceptionItemProps,
} from "./billings.types";
import { Credit } from "./service.types";

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

  // only applicable if teller
  balance?: number;
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
export type TransactionHistoryStatus =
  | "request"
  | "completed"
  | "failed"
  | "pending";

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
  creditId?: string | Credit | null;
  dueDate?: Date | null;
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
  type: "fixed-percentage" | "threshold";
  subType?: string;
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
  price: number | null;
  quantity: number;
  cost: number;
}

export interface ItemWithStock {
  itemId: ItemData;
  stock_count: number;
  createdAt: Date;
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
  items?: BranchItem[];
}

export interface BranchData extends Partial<Branch> {
  _id?: string;
  createdAt?: Date;
}

export interface BranchItem {
  _id?: string;
  itemId: ItemData;
  stock_count: number;
  createdAt: Date;
}

export interface BranchItemUpdate {
  _id: string;
  count: number;
}

// * Log
export type LogType =
  | "attendance"
  | "stock"
  | "credit"
  | "debit"
  | "portal"
  | "credit_payment"
  | "disbursement";
export type LogBalanceType = "bills" | "wallet" | "eload";
export interface Log {
  type: LogType;
  userId: User;
  branchId?: Branch;
  transactionId?: Transaction | string;

  // for attendance
  flexiTime: LogTime[];
  // timeIn?: Date;
  // timeOut?: Date;
  // timeInPhoto?: string;
  // timeOutPhoto?: string;

  // for stock
  stockType?: "stock-in" | "stock-out";
  items?: ItemWithStock[];

  // portal
  portalId?: Portal;
  amount?: number;
  rebate?: number;

  // credit
  userCreditId?: string;
  dueDate?: Date;
  status?: "pending" | "completed";
  interest?: number;
  history?: CreditAmountHistory[];

  // cashbox
  subType?: string;

  remarks?: string;
  attributes?: string;
  createdAt?: Date;
}

export interface LogData extends Log {
  _id: string;
  createdAt?: Date;
}

export interface LogTime {
  type: "time-in" | "time-out";
  time: Date;
  photo: String;
}

// notification

// * PORTAL
export interface Portal {
  _id?: string;
  name: string;
  currentBalance: number;
  assignTo: string[];
  requests?: BalanceRequest[];
}

export type BalanceRequestType = "balance_request";
export interface BalanceRequest {
  _id: string;
  type: BalanceRequestType;
  amount: Number;
  portalId: Portal;
  encoderId: User;
  status: "pending" | "completed" | "rejected";
  createdAt: Date;
}

// * Request Queue
export interface RequestQueue {
  _id?: string;
  transactionId: Transaction;
  branchId: Branch;
  billingType: "bills" | "wallet" | "eload" | "shopee" | "miscellaneous";
  queue: number;
  status: "pending" | "completed" | "rejected";
  extra: Object;
}

// * Credit
export interface UserCredit {
  name: string;
  middlename: string;
  lastname: string;
  address: string;
  phone: string;
  maxCredit: number;
  creditTerm: 7 | 15 | 30;
}

export interface CreditHistory {
  userCreditId: UserCreditData | string;
  transactionId: Transaction | string;
  status: "pending" | "completed";
  amount: number;
  createdAt: Date;
  history: CreditAmountHistory[];
}

export interface UserCreditData extends UserCredit {
  _id: string;
  history?: CreditHistory[];
  availableCredit: number;
}

export interface CreditAmountHistory {
  amount: number;
  date: Date;
  description: string;
}

export interface ThresholdFees {
  _id?: string;
  type: "bills" | "wallet";
  subType?: string;
  link_id: string;
  minAmount: number;
  maxAmount: number;
  charge: number;
}
