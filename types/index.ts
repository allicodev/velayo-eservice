import { CSSProperties, ReactNode } from "react";
import { BillingsFormField } from "./billings.types";

interface DashboardBtnProps {
  icon?: any;
  title: string;
  onPress: () => void;
  style?: CSSProperties;
}

interface DrawerBasicProps {
  open: boolean;
  close: () => void;
  title?: string;
  style?: CSSProperties;
  extra?: ReactNode;
  onCellClick?: (str: any) => void;
}

interface GcashCollapseItemButtonProps {
  key?: string;
  label: string;
  onClickTitle?: (str: string) => void;
  onClickCashIn?: () => void;
  onClickCashOut?: () => void;
}

type TransactionHistoryDataType_type = "pending" | "completed" | "failed";
type TransactionNameType = "gcash" | "eload" | "bills";
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

type UserBadgeTitle = "Teller" | "Encoder";

interface UserBadgeProps {
  name: string;
  title: UserBadgeTitle;
  style?: CSSProperties;
}
interface BillsPaymentProps {
  open: boolean;
  close: () => void;
  transaction: TransactionHistoryDataType | null;
}

interface BillsStateDataType {
  open: boolean;
  transaction: TransactionHistoryDataType | null;
}

interface FloatLabelProps {
  children: ReactNode;
  label: string;
  value?: string;
  style?: CSSProperties;
  bool?: boolean;
  labelClassName?: string;
}

interface UserProps {
  name: string;
  key?: number | string;
  username: string;
  email: string;
  role: UserBadgeTitle | string;
  dateCreated?: Date;
}

interface NewUser
  extends Pick<UserProps, "name" | "email" | "username" | "role"> {
  password: string;
}

interface TransactionDetailsProps {
  open: boolean;
  close: () => void;
  transaction: TransactionHistoryDataType | null;
}

interface NewUserProps {
  open: boolean;
  close: () => void;
  onAdd: (obj: NewUser) => void;
}

interface BillsSettings {
  open: boolean;
  close: () => void;
}

interface NewBillerProps {
  open: boolean;
  close: () => void;
  onSave: (str: string) => boolean | void;
}

interface NewOptionProps {
  open: boolean;
  close: () => void;
  formfield?: BillingsFormField | null;
}

//* E-Wallet types

type EWalletTypes = "percent" | "fixed";
interface EWalletDataType {
  name: string;
  type: EWalletTypes;
  value: number;
}

export type {
  DashboardBtnProps,
  DrawerBasicProps,
  GcashCollapseItemButtonProps,
  TransactionHistoryDataType,
  TransactionHistoryDataType_type,
  UserBadgeProps,
  BillsPaymentProps,
  BillsStateDataType,
  FloatLabelProps,
  UserProps,
  NewUserProps,
  NewUser,
  TransactionDetailsProps,
  BillsSettings,
  NewBillerProps,
  NewOptionProps,
  EWalletDataType,
  EWalletTypes,
};

export * from "./billings.types";
