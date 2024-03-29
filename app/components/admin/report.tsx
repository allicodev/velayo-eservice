import React, { useEffect, useState } from "react";
import { Drawer, Layout, Affix, Menu } from "antd";
import { DownOutlined, BarChartOutlined } from "@ant-design/icons";
import { FaRegFileAlt } from "react-icons/fa";

import { Transaction, TransactionReportProps } from "@/types";
import BillService from "@/provider/bill.service";
import ReportDashboard from "./components/dashboard";

const Report = ({ open, close }: TransactionReportProps) => {
  const [recentTransaction, setRecentTransction] = useState<Transaction[]>([]);
  const [activeKey, setActiveKey] = useState("dashboard");
  const bill = new BillService();

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
          overflow: "hidden",
        },
      }}
    >
      <Layout>
        <Affix>
          <Layout.Sider theme="light" width={180} collapsible>
            <Menu
              // onClick={selectedIndex}
              // selectedKeys={selectedKey}
              selectedKeys={[activeKey]}
              onClick={(e) => setActiveKey(e.key)}
              items={[
                {
                  label: "Transaction",
                  key: "dashboard",
                  icon: <BarChartOutlined />,
                },
                {
                  label: "Logs",
                  key: "logs",
                  icon: <FaRegFileAlt />,
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
          {activeKey == "dashboard" ? (
            <ReportDashboard transaction={recentTransaction} />
          ) : null}
        </Layout>
      </Layout>
    </Drawer>
  );
};

export default Report;
