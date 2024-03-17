import React, { useEffect, useState } from "react";

import {
  Button,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
  message,
} from "antd";
import { CopyOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  TransactionOptProps,
  Transaction,
  TransactionHistoryStatus,
} from "@/types";

import { UserBadge } from "@/app/components";
import { EncoderForm } from "@/app/components/teller";
import { useUserStore } from "@/provider/context";
import BillService from "@/provider/bill.service";

// TODO: add filter

const Encoder = () => {
  const [billsOption, setBillsOption] = useState<TransactionOptProps>({
    open: false,
    transaction: null,
  });

  const [trigger, setTrigger] = useState(0);
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<TransactionHistoryStatus | null>(null);

  const { currentUser } = useUserStore();

  const bill = new BillService();

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
      render: (text, record, index) => index + 1,
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
              : "#EFB40D"
          }
        >
          {type.toLocaleUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date Requested",
      dataIndex: "dateCreated",
      key: "date-request",
      render: (date) => dayjs(date).format("MMMM DD, YYYY"),
    },
    {
      title: "Reference No.",
      key: "ref",
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
    {
      title: "Actions",
      align: "center",
      dataIndex: "_id",
      render: (_) => (
        <Space>
          <Button icon={<PrinterOutlined />} />
        </Space>
      ),
    },
  ];

  const getTransactions = (page?: number) => {
    if (!page) page = 1;

    (async (_) => {
      let res = await _.getAllTransaction(page, 10, null);

      if (res?.success) {
        setTransaction(res?.data ?? []);
      }
    })(bill);
  };

  useEffect(() => {
    getTransactions();
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
            style={{
              margin: 25,
            }}
          />

          <Typography.Text style={{ fontSize: 25, marginLeft: 25 }}>
            Transactions
          </Typography.Text>
          <Table
            dataSource={transactions}
            columns={columns}
            rowKey={(e) => e._id ?? e.type}
            style={{
              marginLeft: 10,
              marginRight: 10,
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
      <EncoderForm
        close={() => setBillsOption({ open: false, transaction: null })}
        refresh={() => setTrigger(trigger + 1)}
        {...billsOption}
      />
    </>
  );
};

export default Encoder;
