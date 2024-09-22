import { useCallback, useMemo, useState } from "react";
import {
  TableProps as AntTableProps,
  Button,
  message,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  useDispatch,
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import dayjs from "dayjs";
import Excel from "exceljs";

import { Log, Transaction } from "@/types";
import {
  CashBoxProps,
  ManualCashBoxUpdateProp,
  ManualCashUpdateHandler,
  TableProps,
  UpdateCashFormProp,
} from "./cashbox.types";
import { AppDispatch, RootState } from "@/app/state/store";
import { useUserStore } from "@/provider/context";
import { newLog } from "@/app/state/logs.reducers";

import LogService from "@/provider/log.service";
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const useCashbox = (props: CashBoxProps) => {
  const { setTransactionOpt } = props;
  const [loading, setLoading] = useState("");

  const { currentUser, currentBranch } = useUserStore();
  const reduxLogs = useSelector((state: RootState) => state.logs);
  const [manualCashOpt, setManualCashOpt] = useState<ManualCashBoxUpdateProp>({
    cash: null,
    reason: null,
    cashFrom: null,
  });

  const [openUpdateForm, setOpenUpdateForm] = useState<UpdateCashFormProp>({
    open: false,
    updateType: null,
  });

  const dispatch = useDispatch<AppDispatch>();

  const clearLoading = () => setLoading("");
  const onManualCashUpdate = (key: string, value: any) =>
    setManualCashOpt({ ...manualCashOpt, [key]: value });
  const closeAndReset = () => {
    setManualCashOpt({
      cash: null,
      reason: null,
      cashFrom: null,
    });
    setOpenUpdateForm({
      open: false,
      updateType: null,
    });
  };

  const columns: AntTableProps<Log>["columns"] = [
    {
      title: "Type",
      dataIndex: "subType",
      align: "center",
      width: 100,
      render: (e) => <span style={{ textTransform: "uppercase" }}>{e}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 100,
      render: (e) => (
        <span style={{ color: e < 0 ? "red" : "limegreen" }}>{`${
          e < 0 ? "-" : "+"
        } ₱${Math.abs(e).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}</span>
      ),
    },
    {
      title: "Status",
      align: "center",
      dataIndex: "transactionId",
      width: 150,
      render: (_) => {
        const transaction = _ as Transaction;
        const status = transaction?.history?.at(-1)?.status ?? "";

        if (!status)
          return (
            <Typography.Text type="secondary" italic>
              N/A
            </Typography.Text>
          );

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
      title: "Reason",
      width: 200,
      dataIndex: "attributes",
      render: (_) => {
        const attr = JSON.parse(_);

        return (
          <Typography.Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          >
            {attr.remarks ?? ""}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: "Cash From",
      width: 150,
      dataIndex: "attributes",
      render: (_) => {
        const attr = JSON.parse(_);

        return (
          <Typography.Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          >
            {attr.cash_from ?? ""}
          </Typography.Paragraph>
        );
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

  const updateBalance = async () => {
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
      amount:
        (manualCashOpt.cash || 0) *
        (openUpdateForm.updateType == "deduct" ? -1 : 1),

      attributes: JSON.stringify({
        remarks: manualCashOpt.reason,
        cash_from: manualCashOpt.cashFrom,
      }),
    });

    if (success ?? false) {
      dispatch(newLog({ key: "cash", log: data as Log }));
      clearLoading();
    } else {
      message.error(ApiMessage ?? "Error in the Server");
      clearLoading();
    }
    closeAndReset();
  };

  const getInitBalance = () => {
    const _log = (reduxLogs.cash || []).find(
      (ea) => JSON.parse(ea?.attributes ?? "{}")?.is_initial_balance
    );
    if (_log) return _log.amount;
    return 0;
  };

  const getCurrentBalance = useCallback(
    () =>
      (reduxLogs.cash || []).reduce((p, n) => {
        const transaction = n.transactionId as Transaction;
        const status = transaction?.history?.at(-1)?.status ?? "";

        if (status == "failed") return p;
        return p + (n.amount ?? 0);
      }, 0),
    [reduxLogs]
  );

  const tableProps: TableProps = {
    columns,
  };

  const manualCashUpdateHandler: ManualCashUpdateHandler = useMemo(() => {
    return {
      data: manualCashOpt,
      onManualCashUpdate,
      updateBalance,
    };
  }, [manualCashOpt]);

  const exportExcel = () => {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("Disbursement Report");

    sheet.properties.defaultRowHeight = 20;
    sheet.mergeCells("A1:E1");
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("A1").font = {
      family: 4,
      size: 18,
      bold: true,
    };
    sheet.getCell("A1").value = `DISBURSEMENT Report (${dayjs().format(
      "MMMM DD, YYYY"
    )}) - ${currentUser?.name ?? ""}`;
    sheet.getRow(2).values = ["Type", "Amount", "Reason", "Cash From", "Date"];
    sheet.columns = [
      {
        key: "subType",
        width: 20,
      },
      {
        key: "amount",
        width: 20,
      },
      {
        key: "remarks",

        width: 40,
      },
      {
        key: "cash_from",

        width: 40,
      },
      {
        key: "createdAt",

        width: 20,
      },
    ];

    (reduxLogs.cash || []).map((e) => {
      const attr = JSON.parse(e.attributes ?? "{}");
      sheet.addRow({
        subType: `${e.subType}${
          attr.is_initial_balance ? " (Initial Amount)" : ""
        } `,
        amount: `${e.amount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        remarks: attr.remarks,
        cash_from: attr.cash_from,
        createdAt: dayjs(e.createdAt).format("MMMM DD, YYYY"),
      });
    });

    // styles
    (reduxLogs.cash || []).map((e, i) => {
      sheet.getCell(`A${i + 3}`).alignment = {
        vertical: "middle",
      };
      sheet.getCell(`B${i + 3}`).alignment = {
        horizontal: "right",
      };
      sheet.getCell(`C${i + 3}`).alignment = {
        wrapText: true,
      };
      sheet.getCell(`D${i + 3}`).alignment = {
        wrapText: true,
      };
      sheet.getCell(`E${i + 3}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    });

    let s = (str: string) =>
      sheet.getCell(
        `${str.toLocaleUpperCase()}${(reduxLogs.cash || []).length + 3}`
      );
    s("a").font = {
      family: 4,
      size: 14,
      bold: true,
    };
    s("a").value = "TOTAL";
    s("b").value = `₱${(reduxLogs.cash || [])
      .reduce((p, n) => p + (n.amount ?? 0), 0)
      .toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    s("b").alignment = {
      horizontal: "right",
    };
    ["A", "B", "C", "D", "E"].map((e) => {
      sheet.getCell(`${e}2`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      sheet.getCell(`${e}2`).font = {
        family: 4,
        size: 12,
        bold: true,
      };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `REPORT-${dayjs().format("MM/DD/YYYY")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      message.success("Exported to Excel successfully");
    });
  };

  return {
    tableProps,
    logs: reduxLogs.cash || [],
    loading,
    initBalance: getInitBalance(),
    currentBalance: getCurrentBalance(),
    manualCashUpdateHandler,
    openUpdateForm,
    setOpenUpdateForm,
    closeAndReset,
    exportExcel,
  };
};

export default useCashbox;
