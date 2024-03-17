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
} from "antd";
import { DownOutlined, PrinterOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import BillService from "@/provider/bill.service";

import {
  DrawerBasicProps,
  Transaction,
  TransactionHistoryStatus,
} from "@/types";

const TransactionHistory = ({
  open,
  close,
  title,
  style,
  extra,
  onCellClick,
  refresh,
}: DrawerBasicProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trigger, setTrigger] = useState(0);
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

  const getTransaction = (page: number, pageSize?: number) => {
    if (!pageSize) pageSize = 10;
    (async (_) => {
      let res = await _.getAllTransaction(page, pageSize);

      if (res.success) {
        setTransactions(res?.data ?? []);
      }
    })(bill);
  };

  useEffect(() => {
    if (open) getTransaction(1);
  }, [open, trigger, refresh]);

  return (
    <Drawer
      open={open}
      onClose={close}
      width="100%"
      height="100%"
      closeIcon={<DownOutlined />}
      extra={extra}
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
