import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CopyOutlined } from "@ant-design/icons";

import {
  TransactionOptProps,
  Transaction,
  TransactionHistoryStatus,
  TransactionType,
  User,
} from "@/types";
import notifSound from "../../public/notif.mp3";

import { UserBadge } from "@/app/components";
import { EncoderForm } from "@/app/components/teller";
import { useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import BillService from "@/provider/bill.service";

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

  const [trigger, setTrigger] = useState(0);
  const [total, setTotal] = useState(0);
  const [transactions, setTransaction] = useState<Transaction[]>([]);

  const [isMobile, setIsMobile] = useState<any>();

  const { currentUser } = useUserStore();

  const bill = new BillService();

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
      key: "id",
      dataIndex: "queue",
      width: 50,
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
          style={{ width: 200 }}
          placeholder="Select a Transaction Type"
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
          style={{ width: 200 }}
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
          style={{ width: 300 }}
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
              // if (typeof e == "object" && e.length > 0) exportExcel(e);
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
      let res = await bill.getAllTransaction({
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
    // api.confirm({
    //   title: "Turn on notification sound?",
    //   okText: "YES",
    //   onOk: () => Modal.destroyAll(),
    //   onCancel: () => Modal.destroyAll(),
    // });
  }, []);

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
                    onChange={(e: any) => setFilter({ ...filter, status: e })}
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
                  page: 1,
                  pageSize: 10,
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
    </>
  );
};

export default Encoder;
