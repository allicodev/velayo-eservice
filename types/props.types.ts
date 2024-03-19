import { CSSProperties, ReactNode } from "react";
import {
  UserBadgeTitle,
  NewUser,
  BillingsFormField,
  Wallet,
  BillingSettingsType,
  Transaction,
} from ".";

export interface DashboardBtnProps {
  icon?: any;
  title: string;
  onPress: () => void;
  style?: CSSProperties;
}

export interface DrawerBasicProps {
  open: boolean;
  close: () => void;
  title?: string;
  style?: CSSProperties;
  onCellClick?: (str: any) => void;
  refresh?: number;
}

export interface GcashCollapseItemButtonProps {
  wallet: Wallet;
  onClickTitle?: (str?: string) => void;
  onClickCashIn?: () => void;
  onClickCashOut?: () => void;
}

export interface UserBadgeProps {
  name: string;
  title: UserBadgeTitle | null | string;
  style?: CSSProperties;
}
export interface BillsPaymentProps {
  open: boolean;
  close: () => void;
  transaction: Transaction | null;
  refresh?: () => void;
}

export interface FloatLabelProps {
  children: ReactNode;
  label: string;
  value?: string;
  style?: CSSProperties;
  bool?: boolean;
  labelClassName?: string;
  extra?: ReactNode;
}

export interface UserProps {
  name: string;
  key?: number | string;
  username: string;
  email: string;
  role: UserBadgeTitle | string;
  dateCreated?: Date;
}

export interface TransactionDetailsProps {
  open: boolean;
  close: () => void;
  transaction: Transaction | null;
}

export interface NewUserProps {
  open: boolean;
  close: () => void;
  onAdd: (obj: NewUser) => void;
}

export interface NewBillerProps {
  open: boolean;
  close: () => void;
  onSave: (str: string) => boolean | void;
}

export interface NewWalletProps {
  open: boolean;
  close: () => void;
  onSave: (obj: Wallet) => Promise<string>;
}

export interface UpdateBillerProps {
  open: boolean;
  close: () => void;
  onSave: (str: string) => boolean | void;
  name: string;
}

export interface NewOptionProps {
  open: boolean;
  close: () => void;
  formfield?: BillingsFormField | null;
  onSave: (obj: BillingsFormField) => void;
  id: string | null;
  index: number;
  refresh?: () => void;
  markAsMain: (id: string, index: number) => Promise<boolean | void>;
  deleteOption: (id: string, index: number) => Promise<boolean | void>;
}

export interface BillButtonProps {
  bill: BillingSettingsType;
  isSelected: boolean;
  onSelected: (bill: BillingSettingsType) => void;
}

// backend stuffs

export interface ApiGetProps {
  endpoint: string;
  query?: Record<any, any>;
  publicRoute?: boolean;
}

export interface ApiPostProps {
  endpoint: string;
  payload?: Record<any, any>;
  publicRoute?: boolean;
}
