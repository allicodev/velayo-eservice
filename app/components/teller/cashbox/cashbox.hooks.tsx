import { useState } from "react";
import { TableProps as ATableProps, Button, message, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  useDispatch,
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import dayjs from "dayjs";

import { Log, Transaction } from "@/types";
import { CashBoxProps, TableProps, UpdateType } from "./cashbox.types";
import { AppDispatch, RootState } from "@/app/state/store";
import { useUserStore } from "@/provider/context";
import { newLog } from "@/app/state/logs.reducers";

import LogService from "@/provider/log.service";
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const useCashbox = (props: CashBoxProps) => {
  const { setTransactionOpt } = props;
  const [loading, setLoading] = useState("");

  const [reduxLogs, reduxTeller] = useSelector((state: RootState) => [
    state.logs.cash,
    state.teller,
  ]);

  const { currentUser, currentBranch } = useUserStore();
  const dispatch = useDispatch<AppDispatch>();

  const clearLoading = () => setLoading("");

  const columns: ATableProps<Log>["columns"] = [
    {
      title: "Type",
      dataIndex: "subType",
      render: (e) => <span style={{ textTransform: "uppercase" }}>{e}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (e) => (
        <span style={{ color: e < 0 ? "red" : undefined }}>{`${
          e < 0 ? "-" : ""
        } ₱${Math.abs(e).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}</span>
      ),
    },
    {
      title: "Status",
      align: "center",
      dataIndex: "transactionId",
      render: (_) => {
        const transaction = _ as Transaction;
        const status = transaction?.history?.at(-1)?.status ?? "";
        const color =
          status == "completed"
            ? "green-inverse"
            : status == "pending"
            ? "orange-inverse"
            : "red-inverse";

        return <Tag color={color}>{status.toLocaleUpperCase()}</Tag>;
      },
    },
    {
      title: "Date",
      align: "center",
      dataIndex: "createdAt",
      render: (e) => dayjs(e).format("MMM DD, YYYY hh:mma"),
    },
    {
      title: "Functions",
      align: "center",
      width: 120,
      render: (_, row) => (
        <Tooltip title={row.subType == "manual" ? "N/A" : "View Transaction"}>
          <Button
            icon={<EyeOutlined />}
            disabled={row.subType == "manual"}
            onClick={() =>
              setTransactionOpt({
                open: true,
                transaction: row.transactionId as Transaction,
              })
            }
          />
        </Tooltip>
      ),
    },
  ];

  const updateBalance = async (type: UpdateType, amount: number) => {
    setLoading("adding");
    let {
      success,
      message: ApiMessage,
      data,
    } = await LogService.newLog({
      type: "disbursement",
      subType: "manual",
      userId: currentUser?._id ?? "",
      branchId: currentBranch,
      amount,
    });

    if (success ?? false) {
      dispatch(newLog({ key: "cash", log: data as Log }));
      clearLoading();
    } else {
      message.error(ApiMessage ?? "Error in the Server");
      clearLoading();
    }
  };

  const getCurrentBalance = () =>
    (reduxTeller?.balance ?? 0) +
    reduxLogs.reduce((p, n) => {
      const transaction = n.transactionId as Transaction;
      const status = transaction?.history?.at(-1)?.status ?? "";

      if (status == "failed") return p;
      return p + (n.amount ?? 0);
    }, 0);

  const tableProps: TableProps = {
    columns,
    updateBalance,
  };

  return {
    tableProps,
    logs: reduxLogs,
    loading,
    initBalance: reduxTeller?.balance ?? 0,
    currentBalance: getCurrentBalance(),
  };
};

export default useCashbox;
