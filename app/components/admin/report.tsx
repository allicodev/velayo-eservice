import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Drawer,
  Row,
  Table,
  TableProps,
  Typography,
  Layout,
  Affix,
  Menu,
} from "antd";
import { DownOutlined } from "@ant-design/icons";

import {
  RecentTransaction,
  Transaction,
  TransactionReportProps,
} from "@/types";
import CustomGraph from "./helper/bar_graph";
import BillService from "@/provider/bill.service";

const { Sider } = Layout;

const Report = ({ open, close }: TransactionReportProps) => {
  const [recentTransaction, setRecentTransction] = useState<Transaction[]>([]);
  const bill = new BillService();

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

  useEffect(() => {
    (async (_) => {
      let res = await _.getAllTransaction(1, 10);
      if (res?.success ?? false) setRecentTransction(res?.data ?? []);
    })(bill);
  }, []);

  return (
    <Drawer
      open={open}
      onClose={close}
      placement="bottom"
      height="100%"
      width="100%"
      closeIcon={<DownOutlined />}
      title="Report"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Layout>
        <Affix>
          <Layout.Sider theme="light" width={150} collapsible>
            <Menu
              // onClick={selectedIndex}
              // selectedKeys={selectedKey}
              items={[
                {
                  label: "Transaction",
                  key: "dashboard",
                },
                {
                  label: "Logs",
                  key: "logs",
                },
              ]}
              // defaultSelectedKeys="dashboard"
              style={{
                fontSize: 17,
                height: "100vh",
                paddingLeft: 5,
                paddingRight: 10,
              }}
            />
          </Layout.Sider>
        </Affix>
        <Layout>
          <Row
            gutter={[32, 32]}
            style={{
              padding: 10,
            }}
          >
            <Col span={6}>
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
            <Col span={6}>
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
            <Col span={7} offset={5}>
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
                  dataSource={recentTransaction.map((e): RecentTransaction => {
                    return {
                      type: e.type,
                      sub_type: e.sub_type,
                      amount: e.amount ?? 0,
                      fee: e.fee ?? 0,
                    };
                  })}
                  columns={columns}
                  pagination={false}
                  style={{
                    height: "78vh",
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Layout>
      </Layout>
    </Drawer>
  );
};

export default Report;
