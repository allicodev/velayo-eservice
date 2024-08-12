import React, { useState } from "react";
import { Drawer, Layout, Affix, Menu, Typography, Button } from "antd";
import {
  DownOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { GrTransaction } from "react-icons/gr";
import { GoCreditCard } from "react-icons/go";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { TransactionReportProps } from "@/types";
import TransactionHistory from "./components/transaction_history";
import Portal from "./components/portal";
import Settings from "./settings";

dayjs.extend(relativeTime);

const Report = ({ open, close }: TransactionReportProps) => {
  const [activeKey, setActiveKey] = useState("dashboard");

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          setActiveKey("dashboard");
          close();
        }}
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
          header: {
            padding: "15px 15px 10px 25px",
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
                    label: "Dashboard",
                    key: "dashboard",
                    icon: <BarChartOutlined />,
                  },

                  {
                    label: "Transactions",
                    key: "transactions",
                    icon: <GrTransaction />,
                  },
                  {
                    label: "Portals",
                    key: "portal",
                    icon: <GoCreditCard />,
                  },
                  {
                    label: "Settings",
                    key: "settings",
                    icon: <SettingOutlined />,
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: 15,
              }}
            >
              <Typography.Title level={3}>
                {activeKey.toLocaleUpperCase()}
              </Typography.Title>
            </div>
            {activeKey == "transactions" ? <TransactionHistory /> : null}
            {activeKey == "portal" ? <Portal /> : null}
            {activeKey == "settings" ? <Settings /> : null}
          </Layout>
        </Layout>
      </Drawer>
    </>
  );
};

export default Report;
