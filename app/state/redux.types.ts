import { Log } from "@/types";

// states
export interface ReduxLogs {
  cash: Log[];

  [key: string]: any;
}
// end

// action types
export interface UpdateBalance {
  balance: number;
}

export interface SetLogs {
  key: string;
  logs: Log[];
}

export interface NewLog {
  key: string;
  log: Log;
}
