import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CopyOutlined } from "@ant-design/icons";
import Excel from "exceljs";

import {
  TransactionOptProps,
  Transaction,
  TransactionHistoryStatus,
  TransactionType,
  User,
  Branch,
  Portal,
} from "@/types";
import notifSound from "../../public/notif.mp3";

import { UserBadge } from "@/app/components";
import { EncoderForm } from "@/app/components/teller";
import { useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import BillService from "@/provider/bill.service";
import PortalBalanceHistory from "@/app/components/encoder/portal_balance_history";
import EtcService from "@/provider/etc.service";
import UserService from "@/provider/user.service";
import PortalService from "@/provider/portal.service";

interface FilterProps {
  status?: TransactionHistoryStatus | null;
  type?: TransactionType | null;
  tellerId?: string | null;
  sub_type?: string | null;
  fromDate?: Dayjs | null;
  toDate?: Dayjs | null;
}

const Encoder = () => {
  const [billsOption, setBillsOption] = useState<TransactionOptProps>({
    open: false,
    transaction: null,
  });
  const [openPortalHistory, setOpenPortalHistory] = useState<{
    open: boolean;
    portal: Portal | null;
  }>({
    open: false,
    portal: null,
  });

  const [trigger, setTrigger] = useState(0);
  const [total, setTotal] = useState(0);
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);

  const [isMobile, setIsMobile] = useState<any>();

  const { currentUser } = useUserStore();

  // const [play] = useSound(notifSound);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [api, contextHolder] = Modal.useModal();
  const [fetching, setFetching] = useState(false);
  const [tellers, setTellers] = useState<User[]>([]);

  const [filter, setFilter] = useState<FilterProps>({
    status: "pending",
    type: null,
    tellerId: null,
    sub_type: null,
    fromDate: null,
    toDate: null,
  });

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
          e.type == "miscellaneous" ||
          (e.type == "wallet" &&
            e.sub_type?.toLocaleLowerCase().includes("cash-out"))
            ? (e.amount ?? 0) + (e.fee ?? 0)
            : e.amount,
        serviceFee: e.fee,
        total:
          ((e.amount ?? 0) +
            (e.type == "wallet" &&
            e.sub_type?.toLocaleLowerCase().includes("cash-out")
              ? e.fee ?? 0
              : 0)) *
            (e.type == "wallet" &&
            e.sub_type?.toLocaleLowerCase().includes("cash-out")
              ? -1
              : 1) +
          (e.fee ?? 0),
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

    const totalAmount = trans.reduce((p, n) => p + (n.amount ?? 0), 0);
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
      case "request": {
        return <Tag color="#EFB40D">Request</Tag>;
      }
      default:
        return <Tag>No Status</Tag>;
    }
  };

  const columns: TableProps<Transaction>["columns"] = [
    {
      title: "ID",
      key: "id",
      width: 50,
      render: (_, row, i) => i + 1,
    },
    {
      title: isMobile ? "Type" : "Transaction Type",
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
          {type == "miscellaneous" && isMobile
            ? "Misc"
            : type.toLocaleUpperCase()}
        </Tag>
      ),
    },
    {
      title: isMobile ? "Date" : "Date Requested",
      dataIndex: "createdAt",
      key: "date-request",

      render: (date) => (
        <span style={{ fontSize: isMobile ? "0.9em" : "1em" }}>
          {dayjs(date).format(
            isMobile ? "MMM DD 'YY hh:mma" : "MMMM DD, YYYY hh:mma"
          )}
        </span>
      ),
    },
    {
      title: "Reference No.",
      key: "ref",
      responsive: ["md", "lg"],
      render: (_, { reference }) =>
        reference ? (
          <Typography.Link
            onClick={() => {
              navigator.clipboard
                .writeText(reference)
                .then((e) => message.success("Copied Successfully"));
            }}
          >
            <CopyOutlined /> {reference}
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary" italic>
            Not Available
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

  const getHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Space size={[32, 0]}>
        <Select
          size="large"
          style={{ width: 200 }}
          placeholder="Select a Teller"
          options={tellers.map((e) => ({
            label: e.name,
            value: e.name,
            key: e._id,
          }))}
          onChange={(_, e: any) =>
            setFilter({ ...filter, tellerId: e?.key ?? null })
          }
          allowClear
        />
        <DatePicker.RangePicker
          size="large"
          format="MMMM DD, YYYY"
          onChange={(e) => {
            setFilter({
              ...filter,
              fromDate: e ? e[0] : null,
              toDate: e ? e[1] : null,
            });
          }}
        />
        <Select
          size="large"
          style={{ width: 150 }}
          placeholder="Select a Type"
          options={["bills", "wallet", "eload", "miscellaneous", "shopee"].map(
            (e) => ({
              label: e.toLocaleUpperCase(),
              value: e,
            })
          )}
          onChange={(_, e: any) =>
            setFilter({ ...filter, type: e?.value ?? null })
          }
          allowClear
        />
        <Select
          size="large"
          style={{ width: 150 }}
          placeholder="Select a Status"
          value={filter.status}
          options={["all", "completed", "failed", "pending"].map((e) => ({
            label: e.toLocaleUpperCase(),
            value: e == "all" ? null : e,
          }))}
          onChange={(_, e: any) =>
            setFilter({ ...filter, status: e?.value ?? null })
          }
          allowClear
        />
        <Input
          size="large"
          style={{ width: 250 }}
          placeholder="Search a Biller"
          onChange={(e) => setFilter({ ...filter, sub_type: e.target.value })}
          allowClear
        />
      </Space>
      <Button
        type="primary"
        size="large"
        onClick={() => {
          (async () => {
            await getTransactions({
              page: 1,
              pageSize: 99999999,
              tellerId: filter.tellerId ?? "",
              type: filter.type ?? undefined,
              status: filter.status,
              sub_type: filter.sub_type ?? null,
              fromDate: filter.fromDate ?? null,
              toDate: filter.toDate ?? null,
            }).then((e) => {
              if (typeof e == "object" && e.length > 0) exportExcel(e);
            });
          })();
        }}
      >
        EXPORT
      </Button>
    </div>
  );

  const getTransactions = async ({
    page,
    pageSize,
    tellerId,
    branchId,
    type,
    status,
    sub_type,
    updateTransact = true,
    project,
    fromDate,
    toDate,
  }: {
    page: number;
    pageSize?: number;
    tellerId?: string;
    branchId?: string;
    type?: TransactionType | null;
    status?: TransactionHistoryStatus | null;
    sub_type?: string | null;
    updateTransact?: boolean;
    project?: Record<any, any>;
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
  }): Promise<Transaction[] | any | void> =>
    new Promise(async (resolve, reject) => {
      setFetching(true);
      if (!pageSize) pageSize = 10;
      let res = await BillService.getAllTransaction({
        page,
        pageSize,
        tellerId,
        branchId,
        type,
        status: status ? [status] : null,
        sub_type,
        project,
        fromDate,
        toDate,
        order:
          status && ["completed", "failed"].includes(status)
            ? "descending"
            : "ascending",
        hideCredit: false,
      });

      if (res?.success ?? false) {
        if (!updateTransact) {
          return resolve(res.data);
        }
        setFetching(false);
        setTransaction(res?.data ?? []);
        setTotal(res.meta?.total ?? 10);
        resolve(res.data);
      } else {
        setFetching(false);
        reject();
      }
    });

  const initPusherProvider = () => {
    let channel = new Pusher().subscribe("encoder");
    channel.bind("notify", handleNotify);

    return () => {
      channel.unsubscribe();
    };
  };

  const handleNotify = () => {
    // api.info({
    //   message: "There is a new request transaction",
    //   duration: 0,
    // });
    audioRef.current?.play();
    getTransactions({
      page: 1,
      pageSize: 10,
      tellerId: filter.tellerId ?? "",
      type: filter.type ?? null,
      status: filter.status ?? null,
      sub_type: filter.sub_type ?? null,
      fromDate: filter.fromDate ?? null,
      toDate: filter.toDate ?? null,
    });
  };

  useEffect(() => {
    getTransactions({
      page: 1,
      pageSize: 10,
      tellerId: filter.tellerId ?? "",
      type: filter.type ?? null,
      status: filter.status ?? null,
      sub_type: filter.sub_type ?? null,
      fromDate: filter.fromDate ?? null,
      toDate: filter.toDate ?? null,
    });
    setIsMobile(typeof window !== "undefined" ? window.innerWidth < 768 : null);

    return initPusherProvider();
  }, [trigger, filter]);

  useEffect(() => {
    // check if there is a settings init, otherwise, create an empty one;
    (async (_) => {
      await _.checkSettings();
    })(EtcService);

    (async (_) => {
      let res = await _.getUsers({ page: 1, pageSize: 9999, role: ["teller"] });

      if (res?.success ?? false) setTellers((res?.data as User[]) ?? []);
    })(UserService);

    (async (_) => {
      let res = await _.getPortal({ sort: 1, project: { logs: 0 } });

      if (res?.success ?? false) setPortals(res?.data ?? []);
    })(PortalService);
  }, [trigger]);

  return (
    <>
      <div className="teller main-content">
        <div
          className="body-content"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <UserBadge
            name={currentUser?.name ?? ""}
            title={
              currentUser
                ? `${currentUser.role[0].toLocaleUpperCase()}${currentUser.role.slice(
                    1
                  )}`
                : null
            }
            role="encoder"
            isMobile={isMobile ?? false}
            style={{
              margin: isMobile ? 10 : 25,
            }}
          />

          <Row>
            <Col span={isMobile ? 24 : 21}>
              <Table
                title={() =>
                  isMobile ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography.Text
                        style={{ fontSize: 25, marginLeft: 10 }}
                        onClick={() => handleNotify()}
                      >
                        Transactions
                      </Typography.Text>
                      <Select
                        key="status-filter"
                        defaultValue="pending"
                        onChange={(e: any) =>
                          setFilter({ ...filter, status: e })
                        }
                        style={{
                          width: 100,
                          marginRight: 10,
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
                      />
                    </div>
                  ) : (
                    getHeader()
                  )
                }
                dataSource={transactions}
                columns={columns}
                rowKey={(e) => e._id ?? e.type}
                style={{
                  marginLeft: 10,
                  marginRight: 10,
                }}
                pagination={{
                  total,
                  onChange: (page, pageSize) =>
                    getTransactions({
                      page,
                      pageSize,
                      tellerId: filter.tellerId ?? "",
                      type: filter.type ?? null,
                      status: filter.status ?? null,
                      sub_type: filter.sub_type ?? null,
                      fromDate: filter.fromDate ?? null,
                      toDate: filter.toDate ?? null,
                    }),
                }}
                onRow={(data) => {
                  return {
                    onClick: () =>
                      setBillsOption({ open: true, transaction: data }),
                  };
                }}
              />
            </Col>
            {!isMobile && (
              <Col span={3}>
                <Flex
                  gap={10}
                  style={{
                    marginRight: 10,
                    maxHeight: "80vh",
                    overflowY: "scroll",
                  }}
                  vertical
                >
                  {portals.map((e, i) => {
                    const isLow = e.currentBalance < 2000;

                    return (
                      <Tooltip
                        key={`${e._id}-${i}`}
                        title={
                          e.currentBalance <= 0
                            ? "Balance is 0. Please make a request."
                            : isLow
                            ? "Balance is too low. Please make a request."
                            : ""
                        }
                      >
                        <Card
                          styles={{
                            body: {
                              padding: 10,
                            },
                          }}
                          style={{
                            border:
                              e.currentBalance <= 0
                                ? "1px solid #ff000055"
                                : isLow
                                ? "1px solid #e69b0055"
                                : "",
                          }}
                          onClick={() =>
                            setOpenPortalHistory({ open: true, portal: e })
                          }
                          hoverable
                        >
                          <Typography.Title
                            level={3}
                            style={{
                              marginBottom: 0,
                              color:
                                e.currentBalance <= 0
                                  ? "#ff0000aa"
                                  : isLow
                                  ? "#e69b00aa"
                                  : "",
                            }}
                          >
                            {e.name} Balance
                          </Typography.Title>
                          <Divider
                            style={{
                              margin: "10px 0",
                              borderBlockStart:
                                e.currentBalance <= 0
                                  ? "#ff0000aa"
                                  : isLow
                                  ? "1px solid #e69b00aa"
                                  : "",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography.Title
                              level={4}
                              style={{
                                color:
                                  e.currentBalance <= 0
                                    ? "#ff0000aa"
                                    : isLow
                                    ? "#e69b00aa"
                                    : "",
                              }}
                            >
                              ₱
                              {e.currentBalance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography.Title>
                          </div>
                        </Card>
                      </Tooltip>
                    );
                  })}
                </Flex>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* context */}
      {contextHolder}
      <audio ref={audioRef} src={notifSound} />
      <EncoderForm
        close={() => setBillsOption({ open: false, transaction: null })}
        refresh={() => setTrigger(trigger + 1)}
        isMobile={isMobile}
        {...billsOption}
      />
      <PortalBalanceHistory
        {...openPortalHistory}
        close={() =>
          setOpenPortalHistory({
            open: false,
            portal: null,
          })
        }
      />
    </>
  );
};

export default Encoder;
