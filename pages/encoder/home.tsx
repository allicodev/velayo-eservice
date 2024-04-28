import React, { useEffect, useRef, useState } from "react";

import {
  Modal,
  Select,
  Table,
  TableProps,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { CopyOutlined } from "@ant-design/icons";

import {
  TransactionOptProps,
  Transaction,
  TransactionHistoryStatus,
} from "@/types";
import notifSound from "../../public/notif.mp3";

import { UserBadge } from "@/app/components";
import { EncoderForm } from "@/app/components/teller";
import { useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import BillService from "@/provider/bill.service";

const Encoder = () => {
  const [billsOption, setBillsOption] = useState<TransactionOptProps>({
    open: false,
    transaction: null,
  });

  const [trigger, setTrigger] = useState(0);
  const [total, setTotal] = useState(0);
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<TransactionHistoryStatus | null>("pending");
  const [isMobile, setIsMobile] = useState<any>();

  const { currentUser } = useUserStore();

  const bill = new BillService();

  // const [play] = useSound(notifSound);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [api, contextHolder] = Modal.useModal();

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
          {type.toLocaleUpperCase()}
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

  const getTransactions = ({
    page,
    pageSize,
    status,
  }: {
    page: number;
    pageSize?: number;
    status?: TransactionHistoryStatus[] | null;
  }) => {
    if (!pageSize) pageSize = 10;
    (async (_) => {
      let res = await _.getAllTransaction(page, pageSize, status);

      if (res.success) {
        setTransaction(res?.data ?? []);
        setTotal(res.meta?.total ?? 10);
      }
    })(bill);
  };

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
    getTransactions({ page: 1, status: [selectedStatus!] });
  };

  useEffect(() => {
    getTransactions({ page: 1, status: [selectedStatus!] });
    setIsMobile(typeof window !== "undefined" ? window.innerWidth < 768 : null);
    return initPusherProvider();
  }, [trigger]);

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
              onChange={(e: any) => {
                if (e) getTransactions({ page: 1, status: [e] });
                else getTransactions({ page: 1 });
                setSelectedStatus(e);
              }}
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
          <Table
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
                getTransactions({ page, pageSize, status: [selectedStatus!] }),
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
