import { CSSProperties, ReactNode } from "react";

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
  status: TransactionHistoryDataType_type;
  amount?: number;
  accountNumber?: string;
  accountName?: string;
  mobileNumber?: string;
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

interface NewUserProps {
  open: boolean;
  close: () => void;
  onAdd: (obj: NewUser) => void;
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
};
