import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Typography,
  TableProps,
  Tag,
  Space,
  Button,
  Table,
  message,
  Select,
  DatePicker,
  Tooltip,
} from "antd";
import { DownOutlined, CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import Excel from "exceljs";

import BillService from "@/provider/bill.service";

import {
  Branch,
  DrawerBasicProps,
  ProtectedUser,
  Transaction,
  TransactionHistoryStatus,
  TransactionType,
} from "@/types";
import UserService from "@/provider/user.service";
import { useUserStore } from "@/provider/context";

const TransactionHistory = ({
  open,
  close,
  title,
  style,
  onCellClick,
  refresh,
}: DrawerBasicProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tellers, setTellers] = useState<ProtectedUser[]>([]);
  const [selectedTeller, setSelectedTeller] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bill = new BillService();
  const user = new UserService();

  const { currentBranch, currentUser } = useUserStore();

  // * FILTER
  const [selectedStatus, setSelectedStatus] = useState<
    TransactionHistoryStatus[]
  >(["pending", "failed"]);
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const runTimer = (key: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(function () {
      setSearchName(key);
    }, 500);
  };

  (TransactionHistory as any).openTransaction = async (id: any) => {
    await getTransaction({ page: 1, pageSize: 99999 }).then((__: any) => {
      if (onCellClick) {
        onCellClick(__.filter((e: any) => e._id == id)[0]);
      } else null;
    });
  };

  const getStatusBadge = (str: TransactionHistoryStatus | null) => {
    switch (str) {
      case "pending": {
        return <Tag color="#EFB40D">PENDING</Tag>;
      }
      case "completed": {
        return <Tag color="#29A645">COMPLETED</Tag>;
      }
      case "failed": {
        return <Tag color="#FF0000">FAILED</Tag>;
      }
      default:
        return <Tag>No Status</Tag>;
    }
  };

  const columns: TableProps<Transaction>["columns"] = [
    {
      title: "ID",
      dataIndex: "queue",
    },
    {
      title: "Transaction Type",
      dataIndex: "name",
      key: "name",
      render: (_, { type }) => (
        <Tag
          color={
            type == "wallet"
              ? "#297BFA"
              : type == "bills"
              ? "#28a745"
              : type == "shopee"
              ? "#ee4d2d"
              : type == "eload"
              ? "#4c772d"
              : "#EFB40D"
          }
        >
          {type.toLocaleUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Biller",
      dataIndex: "sub_type",
      render: (_) =>
        _?.toLocaleUpperCase() ?? (
          <Typography.Text type="secondary" italic>
            Not Applicable
          </Typography.Text>
        ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_) => `₱${_}`,
    },
    {
      title: "Date Requested",
      dataIndex: "createdAt",
      key: "date-request",
      render: (date) => dayjs(date).format("MMMM DD, YYYY"),
    },
    {
      title: "Reference No.",
      key: "ref",
      render: (_, { reference, type }) =>
        reference ? (
          <Typography.Link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard
                .writeText(reference)
                .then((e) => message.success("Copied Successfully"));
            }}
          >
            <CopyOutlined /> {reference}
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary" italic>
            {type == "miscellaneous" ? "Not Applicable" : "Not Available"}
          </Typography.Text>
        ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, { history }) =>
        getStatusBadge(history?.at(-1)?.status ?? null),
    },
  ];

  const exportExcel = (trans: Transaction[]) => {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");

    // * set the first row to be the title uwu :3
    sheet.mergeCells("A1:J1");
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("A1").font = {
      family: 4,
      size: 18,
      bold: true,
    };
    sheet.getCell("A1").value = "Transaction Report";
    sheet.getRow(2).values = [
      "Ref Code",
      "Branch Name",
      "Date/Time",
      "Transaction Type",
      "Biller Name / Product Code",
      "Amount",
      "Service Fee",
      "Amount + Service Fee",
      "User",
      "Status",
    ];
    sheet.properties.defaultRowHeight = 20;

    const getTransactionLabel = (c: TransactionType): string => {
      switch (c) {
        case "bills":
          return "Bills Payment";
        case "eload":
          return "E-Load";
        case "wallet":
          return "Online Wallet";
        case "shopee":
          return "Shoppe Self Collect";
        case "miscellaneous":
          return "miscellaneous";
      }
    };

    // Design the header chuyyy
    sheet.columns = [
      {
        key: "refCode",
        width: 30,
      },
      {
        key: "branchName",
        width: 20,
      },
      {
        key: "dateTime",
        width: 20,
      },
      {
        key: "transactionType",
        width: 20,
      },
      {
        key: "billerName",
        width: 30,
      },
      {
        key: "amount",
        width: 15,
      },
      {
        key: "serviceFee",
        width: 15,
      },
      {
        key: "total",
        width: 23,
      },
      {
        key: "user",
        width: 25,
      },
      {
        key: "status",
        width: 12,
      },
    ];

    trans.map((e) => {
      sheet.addRow({
        refCode: e.reference,
        branchName: (e.branchId as Branch)?.name ?? "No Branch",
        dateTime: dayjs(e.createdAt).format("MM/DD/YYYY HH:mm"),
        transactionType: getTransactionLabel(e.type),
        billerName: e.sub_type?.toLocaleUpperCase() ?? "N/A",
        amount:
          e.type == "wallet" && e.sub_type!.split(" ")[1] == "cash-out"
            ? -e.amount!
            : e.amount,
        serviceFee: e.fee,
        total:
          e?.sub_type ?? false
            ? ((e.type == "wallet" && e.sub_type!.split(" ")[1] == "cash-out"
                ? -e.amount!
                : e.amount) ?? 0) + (e.fee ?? 0)
            : e.amount,
        user: typeof e.tellerId == "object" ? e.tellerId.name : "",
        status: (e.history.at(-1)?.status ?? "").toLocaleUpperCase(),
      });
    });

    let s = (str: string) =>
      sheet.getCell(`${str.toLocaleUpperCase()}${trans.length + 3}`);
    s("e").font = {
      family: 4,
      size: 14,
      bold: true,
    };
    s("e").value = "TOTAL";
    s("f").alignment = {
      horizontal: "right",
    };
    s("g").alignment = {
      horizontal: "right",
    };
    s("h").alignment = {
      horizontal: "right",
    };

    const totalAmount = trans.reduce(
      (p, n) =>
        p +
        (n?.sub_type ?? false
          ? n.type == "wallet" && n.sub_type!.split(" ")[1] == "cash-out"
            ? -n.amount!
            : n?.amount ?? 0
          : n.amount!),
      0
    );
    const totalFee = trans.reduce((p, n) => p + (n?.fee ?? 0), 0);

    const parseToMoney = (num: number) =>
      num
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    s("f").value = parseToMoney(totalAmount);
    s("g").value = parseToMoney(totalFee);
    s("h").value = parseToMoney(totalAmount + totalFee);

    // * styles the headers
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((c) => {
      sheet.getCell(`${c}2`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      sheet.getCell(`${c}2`).font = {
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

  const getTransaction = async ({
    page,
    pageSize,
    status,
    fromDate,
    toDate,
    updateTransaction = true,
    tellerId,
  }: {
    page: number;
    pageSize?: number;
    status?: TransactionHistoryStatus[] | null;
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
    updateTransaction?: boolean;
    tellerId?: string;
  }): Promise<Transaction[] | void> => {
    return new Promise(async (resolve, reject) => {
      // setTotal
      if (!pageSize) pageSize = 10;

      let res = await bill.getAllTransaction({
        page,
        pageSize,
        status: status ? status : null,
        order: "descending",
        fromDate,
        toDate,
        tellerId,
      });

      if (res?.success ?? false) {
        if (!updateTransaction) {
          resolve(res?.data ?? []);
        }
        setTransactions(res?.data ?? []);
        setTotal(res.meta?.total ?? 10);
        resolve(res.data);
      } else reject();
    });
  };

  useEffect(() => {
    if (open)
      getTransaction({
        page: 1,
        status: selectedStatus,
        fromDate,
        toDate,
        tellerId: currentUser?._id,
      });
  }, [fromDate, toDate, selectedStatus, open]);

  useEffect(() => {
    if (open)
      (async (_) => {
        let res = await _.getUsers({
          pageSize: 10,
          page: 1,
          role: "teller",
          searchKey: searchName,
        });
        if (res?.success ?? false) setTellers(res?.data ?? []);
      })(user);
  }, [searchName, open]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedStatus(["pending", "failed"]);
        setFromDate(dayjs());
        setToDate(null);
        close();
      }}
      closeIcon={<DownOutlined />}
      height="100%"
      zIndex={1}
      extra={[
        <Space key="extra-container">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div key="fromDate" style={{ marginRight: 10 }}>
              <label htmlFor="fromDate" style={{ marginRight: 5 }}>
                From
              </label>
              <DatePicker
                id="fromDate"
                format="MMMM DD, YYYY"
                value={fromDate}
                onChange={(e: Dayjs) => {
                  if (e) setFromDate(e);
                  else setFromDate(null);
                }}
              />
            </div>
            <div key="toDate">
              <label htmlFor="toDate" style={{ marginRight: 5 }}>
                To
              </label>
              <DatePicker
                id="toDate"
                format="MMMM DD, YYYY"
                value={toDate}
                onChange={(e: Dayjs) => {
                  if (e) {
                    if (e.isBefore(fromDate)) {
                      message.error("To Date should be after from Date");
                      setToDate(null);
                      return;
                    }
                    setToDate(e);
                  } else {
                    setToDate(null);
                  }
                }}
              />
            </div>
          </div>
          <Tooltip title="RESET">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setToDate(null);
                setFromDate(null);
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            onClick={() => {
              (async () => {
                await getTransaction({
                  page: 1,
                  pageSize: 9999,
                  updateTransaction: false,
                  status: selectedStatus,
                  fromDate,
                  toDate,
                  tellerId: currentUser?._id,
                }).then((e) => {
                  if (typeof e == "object" && e.length > 0) exportExcel(e);
                });
              })();
            }}
          >
            EXPORT
          </Button>
        </Space>,
      ]}
      placement="bottom"
      title={
        <Typography.Text style={{ fontSize: 25 }}>
          {title ?? "Transaction History"}
        </Typography.Text>
      }
      style={{
        borderRadius: 10,
      }}
      rootStyle={{
        margin: 20,
      }}
      destroyOnClose
    >
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginBottom: 10,
        }}
      >
        {/* <div style={{ marginRight: 10 }}>
          <label style={{ marginRight: 5 }}>Teller</label>
          <AutoComplete
            style={{
              width: 300,
            }}
            filterOption={(inputValue, option) =>
              option!
                .value!.toString()
                .toUpperCase()
                .indexOf(inputValue.toUpperCase()) !== -1
            }
            onChange={(_) => {
              runTimer(_);
            }}
            options={tellers.map((e) => ({
              label: e.name,
              value: e.name,
              key: e._id,
            }))}
            onSelect={(_, e) => {
              setSelectedTeller(e.key!.toString());
              getTransaction({
                page: 1,
                status: selectedStatus,
                fromDate,
                toDate,
                tellerId: e.key,
              });
            }}
            autoFocus
            allowClear
          />
        </div> */}
        <div>
          <label style={{ marginRight: 5 }}>Status</label>
          <Select
            key="status-filter"
            mode="tags"
            defaultValue={["pending", "failed"]}
            value={selectedStatus}
            tagRender={(props) => {
              const { label, value, closable, onClose } = props;
              const onPreventMouseDown = (
                event: React.MouseEvent<HTMLSpanElement>
              ) => {
                event.preventDefault();
                event.stopPropagation();
              };

              return (
                <Tag
                  color={
                    value == "pending"
                      ? "#EFB40D"
                      : value == "completed"
                      ? "#29A645"
                      : value == null
                      ? "#ccc"
                      : "#FF0000"
                  }
                  onMouseDown={onPreventMouseDown}
                  closable={closable}
                  onClose={onClose}
                  style={{
                    marginInlineEnd: 4,
                  }}
                >
                  {label}
                </Tag>
              );
            }}
            onChange={(e: any) => setSelectedStatus(e)}
            style={{
              minWidth: 120,
            }}
            options={[
              {
                label: "All",
                value: null,
              },
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Completed",
                value: "completed",
              },
              {
                label: "Failed",
                value: "failed",
              },
            ]}
            allowClear
          />
        </div>
      </div>
      <Table
        dataSource={transactions}
        columns={columns}
        style={style}
        scroll={{
          y: "60vh",
        }}
        rowKey={(e) => e._id ?? e.type}
        pagination={{
          defaultPageSize: 10,
          total,
          onChange: (page, pageSize) =>
            getTransaction({
              page,
              pageSize,
              status: selectedStatus,
              fromDate,
              toDate,
              tellerId: currentUser?._id,
            }),
        }}
        onRow={(data) => {
          return {
            onClick: () => {
              if (onCellClick) onCellClick(data);
            },
          };
        }}
      />
    </Drawer>
  );
};

export default TransactionHistory;
