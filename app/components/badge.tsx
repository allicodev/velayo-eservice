import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
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
  Input,
  CollapseProps,
  Collapse,
} from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { CiLogin } from "react-icons/ci";

import { BillingSettingsType, UserBadgeProps, Wallet } from "@/types";
import Cookies from "js-cookie";
import BillService from "@/provider/bill.service";
import WalletService from "@/provider/wallet.service";
import EtcService from "@/provider/etc.service";
import COTracker from "./teller/cashout_tracker";
import { useItemStore, useUserStore } from "@/provider/context";
import WebCamera from "./teller/webcam";
import Webcam from "react-webcam";
import jason from "@/assets/json/constant.json";

const UserBadge = ({
  name,
  style,
  title,
  role,
  isMobile,
  extra,
  setOpenedMenu,
}: UserBadgeProps) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const [openDisableBill, setOpenDisbaleBill] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const [modal, contextHolder] = Modal.useModal();

  // for encoder
  const [bills, setBills] = useState<BillingSettingsType[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [eload, setEload] = useState<string[]>([]);

  // for teller
  const [openCOTracker, setOpenCOTracker] = useState(false);
  const [openWebcam, setOpenWebCam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const bill = new BillService();
  const wallet = new WalletService();
  const etc = new EtcService();

  const { setItems } = useItemStore();
  const { removeUser, removeBranch } = useUserStore();

  // etcetera
  const [walletFilter, setWalletFilter] = useState("");
  const [billerFilter, setBillerFilter] = useState("");
  const [origWallet, setOrigWallet] = useState<Wallet[]>([]);
  const [origBills, setOrigBills] = useState<BillingSettingsType[]>([]);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      headerClass: "collapse-header",
      label: (
        <Typography.Title level={3} style={{ fontWeight: "bolder" }}>
          Bills
        </Typography.Title>
      ),
      children: (
        <>
          <Input
            style={{ marginBottom: 10 }}
            placeholder="Type a biller here..."
            size="large"
            value={billerFilter}
            onChange={(e) => setBillerFilter(e.target.value)}
            addonAfter={
              <Tooltip title="Reset">
                <ReloadOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => setBills(origBills)}
                />
              </Tooltip>
            }
            allowClear
          />
          <Row gutter={[16, 16]}>
            <Space
              direction="vertical"
              className="no-scrollbar"
              style={{
                maxHeight: "55vh",
                overflow: "scroll",
              }}
            >
              {bills &&
                bills.filter((e) =>
                  e.name
                    .toLocaleLowerCase()
                    .includes(billerFilter.toLocaleLowerCase())
                ).length > 0 &&
                bills
                  .filter((e) =>
                    e.name
                      .toLocaleLowerCase()
                      .includes(billerFilter.toLocaleLowerCase())
                  )
                  .map((e, i) => (
                    <Col
                      key={`bill-${i}`}
                      span={12}
                      style={{
                        display: "flex",
                        cursor: "pointer",
                        maxWidth: "100%",
                      }}
                      onClick={() => {
                        setIsUpdated(true);
                        setBills((prevItems) =>
                          prevItems.map((item, _) => ({
                            ...item,
                            isDisabled:
                              e._id == item._id
                                ? !item.isDisabled
                                : item.isDisabled,
                          }))
                        );
                      }}
                    >
                      <Checkbox
                        checked={e.isDisabled}
                        style={{ marginRight: 10 }}
                      />{" "}
                      <Typography.Text style={{ fontSize: "1.2em" }}>
                        {e.name}
                      </Typography.Text>
                    </Col>
                  ))}
            </Space>
          </Row>
        </>
      ),
    },
    {
      key: "2",
      label: (
        <Typography.Title level={3} style={{ fontWeight: "bolder" }}>
          Wallets
        </Typography.Title>
      ),
      children: (
        <>
          <Input
            style={{ marginBottom: 10 }}
            placeholder="Type a wallet here..."
            size="large"
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            addonAfter={
              <Tooltip title="Reset">
                <ReloadOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => setWallets(origWallet)}
                />
              </Tooltip>
            }
            allowClear
          />
          <Row gutter={[16, 16]}>
            <Space
              direction="vertical"
              className="no-scrollbar"
              style={{
                maxHeight: "55vh",
                overflow: "scroll",
              }}
            >
              {wallets &&
                wallets.filter((e) =>
                  e.name
                    .toLocaleLowerCase()
                    .includes(walletFilter.toLocaleLowerCase())
                ).length > 0 &&
                wallets
                  .filter((e) =>
                    e.name
                      .toLocaleLowerCase()
                      .includes(walletFilter.toLocaleLowerCase())
                  )
                  .map((e, i) => (
                    <Col
                      key={`wallet-${i}`}
                      span={12}
                      style={{
                        display: "flex",
                        maxWidth: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setIsUpdated(true);
                        setWallets((prevItems) =>
                          prevItems.map((item, _) => ({
                            ...item,
                            isDisabled:
                              e._id == item._id
                                ? !item.isDisabled
                                : item.isDisabled,
                          }))
                        );
                      }}
                    >
                      <Checkbox
                        checked={e.isDisabled}
                        style={{ marginRight: 10 }}
                      />{" "}
                      <strong style={{ fontSize: "1.2em" }}>{e.name}</strong>
                    </Col>
                  ))}
            </Space>
          </Row>
        </>
      ),
    },
    {
      key: "3",
      label: (
        <Typography.Title level={3} style={{ fontWeight: "bolder" }}>
          Eload
        </Typography.Title>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Space
            direction="vertical"
            className="no-scrollbar"
            style={{
              maxHeight: "55vh",
              overflow: "scroll",
              // marginTop: 50,
            }}
          >
            {jason.provider.map((e, i) => (
              <Col
                key={`wallet-${i}`}
                span={12}
                style={{
                  display: "flex",
                  width: 250,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsUpdated(true);
                  if (eload.includes(e)) setEload(eload.filter((_) => e != _));
                  else setEload([...eload, e]);
                }}
              >
                <Checkbox
                  checked={eload.includes(e)}
                  style={{ marginRight: 10 }}
                />{" "}
                <strong style={{ fontSize: "1.2em" }}>{e}</strong>
              </Col>
            ))}
          </Space>
        </Row>
      ),
    },
  ];

  const getBillsAndWallets = () => {
    (async (_) => {
      let res = await _.getBill();

      if (res.success) {
        setBills(res.data ?? []);
        setOrigBills(res?.data ?? []);
      }
    })(bill);
    (async (_) => {
      let res = await _.getWallet();

      if (res.success) {
        setWallets(res.data ?? []);
        setOrigWallet(res?.data ?? []);
      }
    })(wallet);
  };

  const handleUpdate = () => {
    (async (_) => {
      let res = await _.disableWalletBills(bills, wallets);

      if (res.success) {
        message.success(res?.message ?? "Success");
        setIsUpdated(false);
      }

      if (eload.length > 0) {
        let res2 = await _.updateEloadSettings(eload);

        if (res2?.success ?? false) setTrigger(trigger + 1);
      }
    })(etc);
  };

  useEffect(() => {
    let sec = Number.parseInt(dayjs().format("ss"));
    setTimeout(() => {
      setInterval(() => {
        setCurrentTime(dayjs());
      }, 60 * 1000);
    }, 60 * 1000 - sec * 1000);
  }, []);

  useEffect(() => {
    if (openDisableBill) getBillsAndWallets();
  }, [openDisableBill]);

  useEffect(() => {
    (async (_) => {
      let res2 = await _.getEloadSettings();
      if (res2?.success ?? false) setEload(res2?.data?.disabled_eload ?? []);
    })(etc);
  }, [trigger]);

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
            overlayStyle={{
              width: 110,
            }}
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
                ["teller", "accounting", "encoder"].includes(role ?? "")
                  ? {
                      key: "time-in",
                      label: (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CiLogin
                            style={{ marginRight: 3, fontSize: "1.15em" }}
                          />{" "}
                          Attendance
                        </div>
                      ),
                      onClick: () => setOpenWebCam(true),
                    }
                  : null,
                role == "teller"
                  ? {
                      key: "1",
                      label: (
                        <>
                          <SearchOutlined /> Track
                        </>
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
                        removeUser();
                        removeBranch();
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
        styles={{
          body: {
            maxHeight: "70vh",
          },
        }}
        footer={[
          <Button
            key="btn-disabled"
            size="large"
            type="primary"
            disabled={!isUpdated}
            onClick={handleUpdate}
            block={isMobile}
            style={{
              height: 50,
              minWidth: 100,
            }}
          >
            Update
          </Button>,
        ]}
        title={<Typography.Title level={2}>Disable Options</Typography.Title>}
        width={1200}
      >
        {isMobile ? (
          <Collapse size="large" accordion items={items} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={7}>
              {items[0].label}
              {items[0].children}
            </Col>
            <Col span={1}>
              <Divider
                type="vertical"
                style={{
                  height: "70vh",
                }}
              />
            </Col>
            <Col span={7}>
              {items[1].label}
              {items[1].children}
            </Col>
            <Col span={1}>
              <Divider
                type="vertical"
                style={{
                  height: "70vh",
                }}
              />
            </Col>
            <Col span={8}>
              {items[2].label}
              {items[2].children}
            </Col>
          </Row>
        )}
      </Modal>
      <COTracker
        open={openCOTracker}
        close={() => setOpenCOTracker(false)}
        setOpenedMenu={setOpenedMenu!}
      />
      <WebCamera
        open={openWebcam}
        close={() => setOpenWebCam(false)}
        webcamRef={webcamRef}
      />
    </>
  );
};

export { UserBadge };
