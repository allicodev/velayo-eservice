import { CSSProperties } from "react";

interface DashboardBtnProps {
  icon?: any;
  title: string;
  onPress: () => void;
}

interface DrawerBasicProps {
  open: boolean;
  close: () => void;
}

interface GcashCollapseItemButtonProps {
  key?: string;
  label: string;
  onClickTitle?: (str: string) => void;
  onClickCashIn?: () => void;
  onClickCashOut?: () => void;
}

type TransactionHistoryDataType_type = "pending" | "completed" | "failed";
interface TransactionHistoryDataType {
  id: number;
  key: number | string;
  type: string;
  dateCreated: Date;
  reference?: string | null;
  status: TransactionHistoryDataType_type;
}

type UserBadgeTitle = "Teller" | "Encoder";
interface UserBadgeProps {
  name: string;
  title: UserBadgeTitle;
  style?: CSSProperties;
}

export type {
  DashboardBtnProps,
  DrawerBasicProps,
  GcashCollapseItemButtonProps,
  TransactionHistoryDataType,
  TransactionHistoryDataType_type,
  UserBadgeProps,
};
