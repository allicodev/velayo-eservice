import React from "react";
import { Modal, Table, TableProps } from "antd";

import { Transaction } from "@/types";

interface ItemData {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  cost: number;
}

const TransactionViewer = ({
  open,
  close,
  transaction,
}: {
  open: boolean;
  close: () => void;
  transaction: Transaction | null;
}) => {
  const items: ItemData[] = JSON.parse(transaction?.transactionDetails ?? "[]");

  const columns: TableProps<ItemData>["columns"] = [
    {
      title: "Item Name",
      dataIndex: "name",
    },
    {
      title: "Unit Name",
      dataIndex: "unit",
      render: (_) => _.toLocaleUpperCase(),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (_) =>
        `₱${_.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Cost",
      dataIndex: "cost",
      render: (_) =>
        `₱${_.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Quantity",
      align: "center",
      dataIndex: "quantity",
    },
    {
      title: "Price x Quantity",
      align: "center",
      render: (_, row) =>
        `₱${(row.price * row.quantity).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Cost x Quantity",
      align: "center",
      render: (_, row) =>
        `₱${(row.cost * row.quantity).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];
  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={null}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        summary={(data) => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <span
                  style={{
                    fontWeight: 900,
                    fontFamily: "sans-serif",
                  }}
                >
                  PROFIT/FEE: ₱
                  {(
                    items.reduce((p, n) => p + n.price * n.quantity, 0) -
                    items.reduce((p, n) => p + n.cost * n.quantity, 0)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} />
              <Table.Summary.Cell index={2} />
              <Table.Summary.Cell index={3} />
              <Table.Summary.Cell index={4} />
              <Table.Summary.Cell index={5}>
                <span style={{ marginRight: 5 }}>
                  TOTAL: ₱
                  {items
                    .reduce((p, n) => p + n.price * n.quantity, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                <span style={{ marginRight: 5 }}>
                  TOTAL: ₱
                  {items
                    .reduce((p, n) => p + n.cost * n.quantity, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Modal>
  );
};

export default TransactionViewer;
