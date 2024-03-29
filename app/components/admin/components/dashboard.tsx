import React from "react";

import { RecentTransaction, Transaction } from "@/types";
import { Row, Col, Card, Typography, Table, TableProps } from "antd";
import CustomGraph from "../helper/bar_graph";

const ReportDashboard = ({ transaction }: { transaction: Transaction[] }) => {
  const columns: TableProps<RecentTransaction>["columns"] = [
    {
      title: "Type",
      dataIndex: "type",
      render: (_) => _.toLocaleUpperCase(),
    },
    {
      title: "biller",
      dataIndex: "sub_type",
      render: (_) => _.toLocaleUpperCase(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_) => `₱${_}`,
    },
    {
      title: "Fee",
      dataIndex: "fee",
      render: (_) => `₱${_}`,
    },
  ];
  return (
    <Row
      gutter={[32, 32]}
      style={{
        padding: 10,
      }}
    >
      <Col span={7}>
        <CustomGraph
          title="Transactions"
          graphTitle="123,456"
          color="#37b99c"
          prevMonth={{
            positive: true,
            value: 3.14,
          }}
          prevYear={{
            positive: false,
            value: 3.14,
          }}
          labels={["Jan", "Feb", "Mar", "Apr", "May"]}
          data={Array(5)
            .fill(null)
            .map(() => Math.floor(Math.random() * 10))}
        />
      </Col>
      <Col span={7}>
        <CustomGraph
          title="Net Income"
          graphTitle="₱10,456"
          color="#00ff00"
          prevMonth={{
            positive: true,
            value: 3.14,
          }}
          prevYear={{
            positive: false,
            value: 3.14,
          }}
          labels={["Jan", "Feb", "Mar", "Apr", "May"]}
          data={Array(5)
            .fill(null)
            .map(() => Math.floor(Math.random() * 10))}
        />
      </Col>
      <Col span={8} offset={2}>
        <Card hoverable>
          <Typography.Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            Recent Transaction
          </Typography.Title>
          <Table
            dataSource={transaction.map((e): RecentTransaction => {
              return {
                type: e.type,
                sub_type: e.sub_type,
                amount: e.amount ?? 0,
                fee: e.fee ?? 0,
              };
            })}
            columns={columns}
            pagination={false}
            scroll={{
              y: "70vh",
            }}
            style={{
              height: "78vh",
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ReportDashboard;
