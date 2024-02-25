import React from "react";
import {
  Drawer,
  Typography,
  TableProps,
  Tag,
  Space,
  Button,
  Table,
} from "antd";
import { LeftOutlined, PrinterOutlined, CopyOutlined } from "@ant-design/icons";

import {
  DrawerBasicProps,
  TransactionHistoryDataType,
  TransactionHistoryDataType_type,
} from "@/types";
import dayjs from "dayjs";

const TransactionHistory = ({ open, close }: DrawerBasicProps) => {
  const mock: TransactionHistoryDataType[] = [
    {
      id: 1,
      key: 1,
      type: "gcash",
      dateCreated: new Date(2024, 1, 21),
      reference: null,
      status: "pending",
    },
    {
      id: 2,
      key: 2,
      type: "gcash",
      dateCreated: new Date(2024, 1, 20),
      reference: "090909",
      status: "completed",
    },
    {
      id: 3,
      key: 3,
      type: "ELOAD",
      dateCreated: new Date(2024, 1, 20),
      reference: "123456",
      status: "completed",
    },
    {
      id: 4,
      key: 4,
      type: "gcash",
      dateCreated: new Date(2024, 1, 22),
      reference: null,
      status: "failed",
    },
    {
      id: 5,
      key: 5,
      type: "gcash",
      dateCreated: new Date(2024, 1, 21),
      reference: null,
      status: "pending",
    },
    {
      id: 6,
      key: 6,
      type: "gcash",
      dateCreated: new Date(2024, 1, 20),
      reference: "090909",
      status: "completed",
    },
    {
      id: 7,
      key: 7,
      type: "ELOAD",
      dateCreated: new Date(2024, 1, 20),
      reference: "123456",
      status: "completed",
    },
  ];

  const getStatusBadge = (str: TransactionHistoryDataType_type) => {
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
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type == "gcash" ? "#297BFA" : "#EFB40D"}>
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
          <Typography.Link>
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
      render: (_, { status }: { status: TransactionHistoryDataType_type }) =>
        getStatusBadge(status),
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
      closeIcon={<LeftOutlined />}
      title={
        <Typography.Text style={{ fontSize: 25 }}>
          Transaction History
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
      <Table dataSource={mock} columns={columns} />
    </Drawer>
  );
};

export default TransactionHistory;
