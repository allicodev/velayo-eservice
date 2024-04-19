import React, { useEffect, useState } from "react";
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
} from "antd";
import { DownOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import Excel from "exceljs";

import BillService from "@/provider/bill.service";

import {
  DrawerBasicProps,
  Transaction,
  TransactionHistoryStatus,
  TransactionType,
} from "@/types";

const TransactionHistory = ({
  open,
  close,
  title,
  style,
  onCellClick,
  refresh,
}: DrawerBasicProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const bill = new BillService();

  // * FILTER
  const [selectedStatus, setSelectedStatus] = useState<
    TransactionHistoryStatus[]
  >(["pending", "failed"]);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  (TransactionHistory as any).openTransaction = async (id: any) => {
    await getTransaction({ page: 1 }).then((__: any) => {
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
      render: (_) => _.toLocaleUpperCase(),
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
    sheet.mergeCells("A1:O1");
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
      "Delivery Type",
      "Biller Name / Product Code",
      "Account Details",
      "Account Name",
      "Amount",
      "Service Fee",
      "Branch Commision",
      "Running Balance",
      "Remarks",
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
        width: 47,
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
        key: "deliveryType",
        width: 15,
      },
      {
        key: "billerName",
        width: 30,
      },
      {
        key: "accountDetails",
        width: 20,
      },
      {
        key: "accountName",
        width: 15,
      },
      {
        key: "amount",
        width: 10,
      },
      {
        key: "serviceFee",
        width: 15,
      },
      {
        key: "branchCommision",
        width: 20,
      },
      {
        key: "runningBalance",
        width: 20,
      },
      {
        key: "remarks",
        width: 30,
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
        branchName: "VELAYO BILLS PAYMENT AND REMITTANCE SERVICES",
        dateTime: dayjs(e.createdAt).format("MM/DD/YYYY HH:mm"),
        transactionType: getTransactionLabel(e.type),
        deliveryType: "",
        billerName: e.sub_type.toLocaleUpperCase(),
        accountDetails: "",
        accountName: "",
        amount: e.amount,
        serviceFee: e.fee,
        branchCommision: "",
        runningBalance: "",
        remarks: "",
        user: "",
        status: (e.history.at(-1)?.status ?? "").toLocaleUpperCase(),
      });
    });

    // * styles the headers
    [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
    ].map((c) => {
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
    });
  };

  const getTransaction = async ({
    page,
    pageSize,
    status,
    fromDate,
    toDate,
    updateTransaction = true,
  }: {
    page: number;
    pageSize?: number;
    status?: TransactionHistoryStatus[] | null;
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
    updateTransaction?: boolean;
  }): Promise<Transaction[] | void> => {
    return new Promise(async (resolve, reject) => {
      // setTotal
      if (!pageSize) pageSize = 10;

      let res = await bill.getAllTransaction(
        page,
        pageSize,
        status ? status : null,
        "descending",
        fromDate,
        toDate
      );

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
    if (open) getTransaction({ page: 1, status: selectedStatus });
  }, [open, refresh]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedStatus(["pending", "failed"]);
        setFromDate(null);
        setToDate(null);
        close();
      }}
      width="100%"
      height="100%"
      closeIcon={<DownOutlined />}
      extra={[
        <Space key="extra-container">
          <div key="fromDate">
            <label htmlFor="fromDate">From: </label>
            <DatePicker
              id="fromDate"
              format="MMMM DD, YYYY"
              onChange={(e: Dayjs) => {
                setFromDate(e);
                if (e) {
                  getTransaction({
                    page: 1,
                    pageSize: 10,
                    status: selectedStatus,
                    toDate,
                    fromDate: e,
                  });
                } else {
                  setFromDate(null);
                  getTransaction({
                    page: 1,
                    pageSize: 10,
                    status: selectedStatus,
                    toDate,
                  });
                }
              }}
            />
          </div>
          <div key="toDate">
            <label htmlFor="toDate">To: </label>
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
                  getTransaction({
                    page: 1,
                    pageSize: 10,
                    status: selectedStatus,
                    fromDate,
                    toDate: e,
                  });
                } else {
                  setToDate(null);
                  getTransaction({
                    page: 1,
                    pageSize: 10,
                    status: selectedStatus,
                    fromDate,
                  });
                }
              }}
            />
          </div>
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
            onChange={(e: any) => {
              setSelectedStatus(e);
              if (e) getTransaction({ page: 1, status: e });
              else getTransaction({ page: 1 });
            }}
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
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
      }}
      rootStyle={{
        marginTop: 20,
        marginLeft: 20,
        marginBottom: 20,
      }}
    >
      <Table
        dataSource={transactions}
        columns={columns}
        style={style}
        rowKey={(e) => e._id ?? e.type}
        pagination={{
          pageSize: 10,
          hideOnSinglePage: true,
          total,
          onChange: (page, pageSize) =>
            getTransaction({ page, pageSize, status: selectedStatus }),
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
