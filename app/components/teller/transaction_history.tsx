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
} from "antd";
import { DownOutlined, CopyOutlined } from "@ant-design/icons";
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
  onCellClick,
  refresh,
}: DrawerBasicProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    TransactionHistoryStatus[]
  >(["pending", "failed"]);
  const [trigger, setTrigger] = useState(0);
  const bill = new BillService();

  (TransactionHistory as any).openTransaction = async (id: any) => {
    await getTransaction({ page: 1 }).then((__: any) => {
      if (onCellClick) {
        console.log(id);
        console.log(__);
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
      dataIndex: "dateCreated",
      key: "date-request",
      render: (date) => dayjs(date).format("MMMM DD, YYYY"),
    },
    {
      title: "Reference No.",
      key: "ref",
      render: (_, { reference, type }) =>
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

  const getTransaction = ({
    page,
    pageSize,
    status,
  }: {
    page: number;
    pageSize?: number;
    status?: TransactionHistoryStatus[] | null;
  }): Promise<Transaction[] | void> => {
    return new Promise((resolve, reject) => {
      if (!pageSize) pageSize = 10;
      (async (_) => {
        let res = await _.getAllTransaction(
          page,
          pageSize,
          status ? status : null,
          "descending"
        );

        if (res.success) {
          setTransactions(res?.data ?? []);
          resolve(res.data);
        } else reject();
      })(bill);
    });
  };

  useEffect(() => {
    if (open) getTransaction({ page: 1, status: ["pending", "failed"] });
  }, [open, trigger, refresh]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedStatus(["pending", "failed"]);
        close();
      }}
      width="100%"
      height="100%"
      closeIcon={<DownOutlined />}
      extra={[
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
        />,
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
