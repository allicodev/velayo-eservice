import React, { useEffect, useState } from "react";
import {
  Drawer,
  Layout,
  Affix,
  Menu,
  Button,
  Typography,
  Badge,
  Dropdown,
  List,
} from "antd";
import {
  DownOutlined,
  BarChartOutlined,
  CalendarOutlined,
  BellOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { GrTransaction } from "react-icons/gr";

import { Transaction, TransactionReportProps, Notification } from "@/types";
import BillService from "@/provider/bill.service";
import Attendance from "./components/attendance";
import TransactionHistory from "./components/transaction_history";
import EtcService from "@/provider/etc.service";
import NotificationViewer from "./components/notification_viewer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Report = ({ open, close }: TransactionReportProps) => {
  const [recentTransaction, setRecentTransction] = useState<Transaction[]>([]);
  const [notif, setNotif] = useState<Notification[]>([]);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [openNotif, setOpenNotif] = useState<{
    open: boolean;
    notif: Notification | null;
  }>({ open: false, notif: null });

  const bill = new BillService();
  const etc = new EtcService();

  const fetchNotif = () => {
    (async (_) => {
      let res = await _.getNotif({ page: 1, pageSize: 999 });
      if (res?.success ?? false) setNotif(res?.data ?? []);
    })(etc);
  };

  useEffect(() => {
    // (async (_) => {
    //   let res = await _.getAllTransaction({ page: 1, pageSize: 10 });
    //   if (res?.success ?? false) setRecentTransction(res?.data ?? []);
    // })(bill);

    fetchNotif();
  }, []);

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
        extra={
          <Dropdown
            trigger={["click"]}
            dropdownRender={() => {
              return (
                <div
                  style={{
                    maxHeight: 400,
                    width: 400,
                    overflow: "scroll",
                    background: "#fff",
                    borderRadius: 5,
                    boxShadow:
                      "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <List
                    header={
                      <Typography.Title
                        level={4}
                        style={{
                          margin: 0,
                        }}
                      >
                        Notifications ({notif.length})
                      </Typography.Title>
                    }
                    // footer={<div>Total of {notif.length} notification(s)</div>}
                    dataSource={notif}
                    bordered
                    renderItem={(item) => (
                      <List.Item
                        className="notif-list"
                        onClick={() =>
                          setOpenNotif({ open: true, notif: item })
                        }
                        style={{ background: item.isRead ? "" : "#00ff0033" }}
                      >
                        <div>
                          <Typography.Text
                            style={{
                              maxWidth: 320,
                            }}
                            ellipsis
                          >
                            {item.description}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            {dayjs(item.createdAt).fromNow()}
                          </Typography.Text>
                        </div>
                        <Button icon={<DeleteOutlined />} danger />
                      </List.Item>
                    )}
                  />
                </div>
              );
            }}
          >
            <Badge
              count={notif.filter((e) => !e.isRead).length}
              showZero={false}
              offset={[-5, 2]}
            >
              <div
                style={{
                  background: "#0000ff11",
                  borderRadius: "100%",
                }}
              >
                <BellOutlined
                  style={{ fontSize: "1.3em", cursor: "pointer", padding: 8 }}
                />
              </div>
            </Badge>
          </Dropdown>
        }
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
                    label: (
                      <Badge
                        count={notif.filter((e) => !e.isRead).length}
                        showZero={false}
                        offset={[10, 0]}
                      >
                        <Typography.Text style={{ fontSize: "1em" }}>
                          Dashboard
                        </Typography.Text>
                      </Badge>
                    ),
                    key: "dashboard",
                    icon: <BarChartOutlined />,
                  },
                  {
                    label: "Attendance",
                    key: "attendance",
                    icon: <CalendarOutlined />,
                  },
                  {
                    label: "Transactions",
                    key: "transactions",
                    icon: <GrTransaction />,
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
                {activeKey == "attendance" ? "EMPLOYEE " : ""}
                {activeKey.toLocaleUpperCase()}
              </Typography.Title>
            </div>
            {activeKey == "attendance" ? <Attendance /> : null}
            {activeKey == "transactions" ? <TransactionHistory /> : null}
          </Layout>
        </Layout>
      </Drawer>

      {/* context */}
      <NotificationViewer
        {...openNotif}
        close={() => {
          setOpenNotif({ open: false, notif: null });
          fetchNotif();
        }}
      />
    </>
  );
};

export default Report;
