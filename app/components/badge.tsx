import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  Row,
  Col,
  Divider,
  Checkbox,
  message,
  Space,
} from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { BillingSettingsType, UserBadgeProps, Wallet } from "@/types";
import Cookies from "js-cookie";
import BillService from "@/provider/bill.service";
import WalletService from "@/provider/wallet.service";
import EtcService from "@/provider/etc.service";
import COTracker from "./teller/cashout_tracker";
import { useItemStore } from "@/provider/context";

const UserBadge = ({
  name,
  style,
  title,
  role,
  isMobile,
  extra,
  setOpenedMenu,
}: UserBadgeProps) => {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [openDisableBill, setOpenDisbaleBill] = useState(false);

  const [modal, contextHolder] = Modal.useModal();

  // for encoder
  const [bills, setBills] = useState<BillingSettingsType[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isUpdated, setIsUpdated] = useState(false);

  // for teller
  const [openCOTracker, setOpenCOTracker] = useState(false);

  const bill = new BillService();
  const wallet = new WalletService();
  const etc = new EtcService();

  const { setItems } = useItemStore();

  const getBillsAndWallets = () => {
    (async (_) => {
      let res = await _.getBill();

      if (res.success) {
        setBills(res.data ?? []);
      }
    })(bill);
    (async (_) => {
      let res = await _.getWallet();

      if (res.success) {
        setWallets(res.data ?? []);
      }
    })(wallet);
  };

  const handleUpdate = () => {
    (async (_) => {
      let res = await _.disableWalletBills(bills, wallets);

      if (res.success) {
        message.success(res?.message ?? "Success");
      }
    })(etc);
  };

  useEffect(() => {
    const currentSeconds = dayjs().second();
    setTimeout(
      () => setInterval(() => setCurrentTime(dayjs()), 1000 * 60),
      (60 - currentSeconds) * 1000
    );
  }, []);

  useEffect(() => {
    if (openDisableBill) getBillsAndWallets();
  }, [openDisableBill]);

  return (
    <>
      <div style={style}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text
            style={{
              fontSize: isMobile ? 25 : 45,
              display: "block",
              lineHeight: 0.6,
            }}
          >
            Welcome {title} {name}
          </Typography.Text>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                role == "encoder"
                  ? {
                      key: "1",
                      label: (
                        <span>
                          <SettingOutlined /> Settings
                        </span>
                      ),
                      onClick: () => setOpenDisbaleBill(true),
                    }
                  : null,
                role == "teller"
                  ? {
                      key: "1",
                      label: (
                        <Tooltip title="Track CASH-OUT Transaction">
                          <SearchOutlined /> Track
                        </Tooltip>
                      ),
                      onClick: () => setOpenCOTracker(true),
                    }
                  : null,
                {
                  key: "2",
                  label: (
                    <Tooltip title="Logout">
                      <LogoutOutlined style={{ color: "#f00" }} />{" "}
                      <span style={{ color: "#f00" }}>Logout</span>
                    </Tooltip>
                  ),
                  onClick: () =>
                    modal.confirm({
                      icon: null,
                      title: "Logout Confirmation",
                      content: "Are you sure you want to logout ?",
                      okText: "LOGOUT",
                      okButtonProps: {
                        type: "primary",
                        danger: true,
                      },
                      onOk: () => {
                        Cookies.remove("token");
                        setItems([]);
                        window.location.reload();
                      },
                    }),
                },
              ],
            }}
          >
            <Button
              icon={<SettingOutlined />}
              size="large"
              ghost
              type="primary"
            />
          </Dropdown>
        </div>

        <Typography.Text style={{ fontSize: isMobile ? 18 : 26 }}>
          {currentTime.format("MMMM DD, YYYY - hh:mma")}
        </Typography.Text>
        {extra && <div>{extra}</div>}
      </div>

      {/* context */}
      {contextHolder}
      <Modal
        open={openDisableBill}
        onCancel={() => setOpenDisbaleBill(false)}
        closable={false}
        footer={[
          <Button
            key="btn-disabled"
            size="large"
            type="primary"
            disabled={!isUpdated}
            onClick={handleUpdate}
          >
            Update
          </Button>,
        ]}
        width={600}
        title={<Typography.Title level={2}>Disable Options</Typography.Title>}
      >
        <Row gutter={[16, 16]}>
          <Col span={11}>
            <Typography.Title level={3} style={{ fontWeight: "bolder" }}>
              Bills
            </Typography.Title>
            <Row gutter={[16, 16]}>
              <Space direction="vertical">
                {bills &&
                  bills.length > 0 &&
                  bills.map((e, i) => (
                    <Col
                      key={`bill-${i}`}
                      span={12}
                      style={{ display: "flex", width: 250 }}
                    >
                      <Checkbox
                        checked={e.isDisabled}
                        style={{ marginRight: 10 }}
                        onChange={(e) => {
                          setIsUpdated(true);
                          setBills((prevItems) => {
                            if (prevItems) {
                              return prevItems.map((item, _) => {
                                if (_ == i) item.isDisabled = e.target.checked;
                                return item;
                              });
                            } else return [];
                          });
                        }}
                      />{" "}
                      <strong style={{ fontSize: "1.2em" }}>{e.name}</strong>
                    </Col>
                  ))}
              </Space>
            </Row>
          </Col>
          <Col span={2}>
            <Divider type="vertical" />
          </Col>
          <Col span={11}>
            <Typography.Title level={3} style={{ fontWeight: "bolder" }}>
              Wallets
            </Typography.Title>
            <Row gutter={[16, 16]}>
              <Space direction="vertical">
                {wallets &&
                  wallets.length > 0 &&
                  wallets.map((e, i) => (
                    <Col
                      key={`wallet-${i}`}
                      span={12}
                      style={{ display: "flex", width: 250 }}
                    >
                      <Checkbox
                        checked={e.isDisabled}
                        style={{ marginRight: 10 }}
                        onChange={(e) => {
                          setIsUpdated(true);
                          setWallets((prevItems) => {
                            if (prevItems) {
                              return prevItems.map((item, _) => {
                                if (_ == i) item.isDisabled = e.target.checked;
                                return item;
                              });
                            } else return [];
                          });
                        }}
                      />{" "}
                      <strong style={{ fontSize: "1.2em" }}>{e.name}</strong>
                    </Col>
                  ))}
              </Space>
            </Row>
          </Col>
        </Row>
      </Modal>
      <COTracker
        open={openCOTracker}
        close={() => setOpenCOTracker(false)}
        setOpenedMenu={setOpenedMenu!}
      />
    </>
  );
};

export { UserBadge };
