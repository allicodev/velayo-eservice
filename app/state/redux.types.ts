import { Log } from "@/types";

// states
export interface ReduxLogs {
  cash: Log[];

  [key: string]: any;
}
// end

// action types
export interface UpdateBalance extends CB {
  balance: number;
}

export interface SetLogs extends CB {
  key: string;
  logs: Log[];
}

export interface NewLog extends CB {
  key: string;
  log: Log;
}

interface CB {
  cb?: (_?: any, __?: any) => any | void;
}
