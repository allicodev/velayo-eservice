import React from "react";
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

import {
  DrawerBasicProps,
  TransactionHistoryDataType,
  TransactionHistoryDataType_type,
} from "@/types";
import dayjs from "dayjs";

const TransactionHistory = ({
  open,
  close,
  title,
  style,
  extra,
  onCellClick,
}: DrawerBasicProps) => {
  const mock: TransactionHistoryDataType[] = [
    {
      id: 1,
      key: 1,
      name: "gcash",
      type: "cash-in",
      dateCreated: new Date(2024, 1, 21),
      reference: null,
      amount: 1000,
      mobileNumber: "09123456789",
      accountName: "John Doe",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "Transaction Complete",
          status: "completed",
        },
      ],
    },
    {
      id: 2,
      key: 2,
      name: "bills",
      type: "VECO",
      dateCreated: new Date(2024, 1, 20),
      reference: "090909",
      amount: 1,
      mobileNumber: "09123456789",
      accountName: "John Doe",
      accountNumber: "123-456-789",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "Account Number is invalid",
          status: "failed",
        },
      ],
    },
    {
      id: 3,
      key: 3,
      name: "eload",
      type: null,
      dateCreated: new Date(2024, 1, 20),
      reference: "123456",
      amount: 1000,
      mobileNumber: "09123456789",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "Transaction Completed",
          status: "completed",
        },
      ],
    },
    {
      id: 4,
      key: 4,
      name: "gcash",
      type: "cash-out",
      dateCreated: new Date(2024, 1, 22),
      reference: null,
      amount: 1000,
      mobileNumber: "09123456789",
      accountName: "John Doe",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "Invalid GCASH Number",
          status: "failed",
        },
      ],
    },
    {
      id: 5,
      key: 5,
      name: "gcash",
      type: "cash-out",
      dateCreated: new Date(2024, 1, 21),
      reference: null,
      amount: 1000,
      mobileNumber: "09123456789",
      accountName: "John Doe",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
      ],
    },
    {
      id: 6,
      key: 6,
      name: "gcash",
      type: "cash-in",
      dateCreated: new Date(2024, 1, 20),
      reference: "090909",
      amount: 1000,
      mobileNumber: "09123456789",
      accountName: "John Doe",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "Transaction Complete",
          status: "completed",
        },
      ],
    },
    {
      id: 7,
      key: 7,
      name: "eload",
      type: null,
      dateCreated: new Date(2024, 1, 20),
      reference: "123456",
      amount: 1000,
      mobileNumber: "09123456789",
      history: [
        {
          date: new Date(2024, 1, 21, 6, 8),
          description: "First Transaction Requested",
          status: "pending",
        },
        {
          date: new Date(2024, 1, 21, 6, 10),
          description: "E-Load Complete",
          status: "completed",
        },
      ],
    },
  ];

  const getStatusBadge = (str: TransactionHistoryDataType_type | null) => {
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
  const columns: TableProps<TransactionHistoryDataType>["columns"] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Transaction Type",
      dataIndex: "name",
      key: "name",
      render: (type) => (
        <Tag
          color={
            type == "gcash"
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
      render: (_, e: TransactionHistoryDataType) =>
        getStatusBadge(e.history?.at(-1)?.status ?? null),
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
        dataSource={mock}
        columns={columns}
        style={style}
        rowKey={(e) => e.id}
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
