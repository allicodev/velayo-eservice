import React, { useEffect, useState } from "react";
import {
  Drawer,
  Input,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { LogData, StockType, StockHistory as _StockHistory } from "@/types";
import LogService from "@/provider/log.service";

// todo: add dropdown items for filter beside type

interface BasicProps {
  open: boolean;
  close: () => void;
  branchId: string;
}

const StockHistory = ({ open, close, branchId }: BasicProps) => {
  const [history, setHistory] = useState<_StockHistory[]>([]);
  const [type, setType] = useState<"stock-in" | "stock-out" | "misc" | null>(
    null
  );
  const [fetching, setFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // service and etc
  const log = new LogService();

  const getStockStatusBadge = (type: StockType) =>
    type == "misc" ? (
      <Tag color="orange-inverse">MISC</Tag>
    ) : (
      <Tag color={type == "stock-in" ? "green-inverse" : "red-inverse"}>
        {type.toLocaleUpperCase()}
      </Tag>
    );

  const columns: TableProps<_StockHistory>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Type",
      width: 1,
      render: (_, row) => getStockStatusBadge(row.type!),
    },
    {
      title: "Quantity",
      align: "center",
      width: 1,
      render: (_, row) =>
        ["stock-in", "misc"].includes(row.type ?? "")
          ? row.quantity
          : -(row.quantity ?? 0),
    },
    {
      title: "Date",
      width: 180,
      align: "center",
      render: (_, row) => dayjs(row.date).format("MM/DD/YYYY hh:mma"),
    },
  ];

  const getHistory = async ({
    page = 1,
    pageSize = 10,
    type,
  }: {
    page?: number;
    pageSize?: number;
    type?: "stock-in" | "stock-out" | "misc" | null;
  }) =>
    new Promise(async (resolve) => {
      await log
        .getLog({ page, pageSize, type: "stock", branchId, stockType: type })
        .then((e) => {
          if (e?.success ?? false) {
            setTotal(e.meta?.total ?? 0);
            resolve(e?.data);
          } else resolve([]);
        });
    });

  const fetchHistory = async ({
    page,
    pageSize,
    type,
  }: {
    page?: number;
    pageSize?: number;
    type?: "stock-in" | "stock-out" | "misc" | null;
  }) => {
    setFetching(true);
    await getHistory({
      page,
      pageSize,
      type,
    }).then((e) => {
      let log = e as LogData[];
      let logHistory: any[] = [];
      log.forEach((e: any) => {
        e.items.map((_: any) => {
          logHistory.push({
            date: _.createdAt,
            type: e.stockType,
            quantity: _.stock_count,
            name: _.itemId.name,
            _id: `${e._id}${_.itemId._id}`,
          });
        });
      });

      setHistory(logHistory);
      setFetching(false);
    });
  };

  useEffect(() => {
    if (open) fetchHistory({ type });
  }, [open, type]);

  return (
    <Drawer
      open={open}
      onClose={close}
      closable={false}
      width="40vw"
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          Stock History
        </Typography.Title>
      }
      extra={
        <Space>
          <Input
            size="large"
            placeholder="Search an Item"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={type}
            size="large"
            options={[
              { label: "All", value: null },
              { label: "STOCK-IN", value: "stock-in" },
              { label: "STOCK-OUT", value: "stock-out" },
              { label: "MISCELLANEOUS", value: "misc" },
            ]}
            onChange={(e) => {
              if (e == undefined) setType(null);
              else setType(e);
            }}
            style={{
              width: 150,
            }}
            allowClear
          />
        </Space>
      }
    >
      <Table
        dataSource={history.filter((e) =>
          e.name?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )}
        columns={columns}
        loading={fetching}
        rowKey={(e) => e._id ?? ""}
        pagination={{
          defaultPageSize: 10,
          total,
          onChange: (page, pageSize) =>
            fetchHistory({
              page,
              pageSize,
            }),
        }}
      />
    </Drawer>
  );
};

export default StockHistory;
