import { TransactionType } from ".";

// * User Service
export interface UserLoginProps {
  username: string;
  password: string;
}

export interface UpdateFeeProps {
  id: string;
  fee: number;
  threshold: number;
  additionalFee: number;
}

//* etc service

export interface UpdateBillWallet {
  id: string;
  name: string;
  isDisabled: boolean;
}

// * printer service

export interface Printer {
  pid: string | null;
  connected: boolean;
}

export interface ShopeeSelfCollectPrinter {
  name: string;
  parcelNum: number;
  collectionPins: string[];
}

// * exclude
// * billerId, transactionType, fee,
export interface TransactionPrinter {
  type: TransactionType;
  billerName: string;
  receiptNo: string;
  refNo: string;
  fee: number;
  amount: number;
  otherDetails: string;
}

export interface TransactionPrinterPOS {
  itemDetails: string;
  amount: number;
  cash: number;
  receiptNo: string;
  refNo: string;
}

export interface EloadSettings {
  _id: string;
  disabled_eload: string[];
  fee?: number | undefined;
  threshold?: number | undefined;
  additionalFee?: number | undefined;
}
