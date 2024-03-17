import React, { useEffect, useState } from "react";
import {
  Drawer,
  Typography,
  Collapse,
  Row,
  Col,
  Divider,
  Button,
  Space,
  Card,
  Form,
  Input,
  InputNumber,
} from "antd";
import type { CollapseProps } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import {
  DrawerBasicProps,
  FeeType,
  GcashCollapseItemButtonProps,
  Wallet,
} from "@/types";

import WalletService from "@/provider/wallet.service";

const GcashForm = ({ open, close }: DrawerBasicProps) => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();
  const [selectWalletOption, setSelectedWalletOption] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [amount, setAmount] = useState(0);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [form] = Form.useForm();

  const wallet = new WalletService();

  const toCollapsibleItemButton = ({
    wallet,
    onClickTitle,
    onClickCashIn,
    onClickCashOut,
  }: GcashCollapseItemButtonProps) => {
    return {
      key: wallet._id,
      label: (
        <Button
          style={{
            width: 300,
            fontSize: 35,
            paddingTop: 10,
            paddingBottom: 10,
            height: 70,
            ...(selectedWallet?._id == wallet._id
              ? {
                  background: "#294B0F",
                  color: "#fff",
                }
              : {
                  background: "#fff",
                  color: "#000",
                }),
          }}
          onClick={() => {
            if (wallet._id == selectedWallet?._id) {
              setSelectedWallet(null);
            } else {
              setSelectedWallet(wallet);
              if (onClickTitle) onClickTitle(wallet?._id);
            }
          }}
        >
          {wallet.name.toLocaleUpperCase()}
        </Button>
      ),
      children: (
        <Space direction="vertical">
          <div style={{ marginLeft: 20 }}>
            <RightOutlined style={{ marginRight: 10 }} />
            <Button
              style={{
                width: 150,
                height: 40,
                fontSize: 20,
                ...(selectWalletOption == "cashin"
                  ? {
                      background: "#294B0F",
                      color: "#fff",
                    }
                  : {
                      background: "#fff",
                      color: "#000",
                    }),
              }}
              onClick={onClickCashIn}
            >
              cash-in
            </Button>
          </div>
          <div style={{ marginLeft: 20 }}>
            <RightOutlined style={{ marginRight: 10 }} />
            <Button
              style={{
                width: 150,
                height: 40,
                fontSize: 20,
                ...(selectWalletOption == "cashout"
                  ? {
                      background: "#294B0F",
                      color: "#fff",
                    }
                  : {
                      background: "#fff",
                      color: "#000",
                    }),
              }}
              onClick={onClickCashOut}
            >
              cash-out
            </Button>
          </div>
        </Space>
      ),
      showArrow: false,
    };
  };

  const onClickCashIn = () => {
    setSelectedWalletOption("cashin");
    form.resetFields();
    setAmount(0);
  };
  const onClickCashOut = () => {
    setSelectedWalletOption("cashout");
    form.resetFields();
    setAmount(0);
  };
  const items: CollapseProps["items"] = wallets.map((e) =>
    toCollapsibleItemButton({ wallet: e, onClickCashIn, onClickCashOut })
  );
  const getTitle = () =>
    `${selectedWallet?.name} ${
      selectWalletOption == "cashin" ? "Cash-in" : "Cash-out"
    }`;
  const getFee = () => {
    let feeType: FeeType;
    let fee: number | null;

    if (selectWalletOption == "cashin") {
      feeType = selectedWallet!.cashinType;
      fee = selectedWallet!.cashinFeeValue;
    } else {
      feeType = selectedWallet!.cashoutType;
      fee = selectedWallet!.cashoutFeeValue;
    }

    if (feeType == "percent") return ((amount * fee!) / 100).toFixed(2);
    else return (amount + fee!).toFixed(2);
  };
  const getTotal = () => (amount + +getFee()).toFixed(2);

  const getWallets = () => {
    (async (_) => {
      let res = await _.getWallet();

      if (res.success) {
        setWallets(res?.data ?? []);
      }
    })(wallet);
  };

  const request = () => {};

  const handleFinish = (val: any) => {
    console.log(val);
  };

  useEffect(() => {
    setWindow(window);
  }, []);

  useEffect(() => {
    getWallets();
  }, []);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedWallet(null);
        setSelectedWalletOption("");
        close();
      }}
      width="100%"
      closeIcon={<LeftOutlined />}
      title={
        <Typography.Text style={{ fontSize: 25 }}>
          E-Wallet Service
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
      <Row>
        <Col span={6}>
          <Collapse
            onChange={() => setSelectedWalletOption("")}
            style={{
              background: "#fff",
            }}
            items={items}
            bordered={false}
            destroyInactivePanel
            activeKey={selectedWallet?._id}
            accordion
          />
        </Col>
        <Col span={1}>
          <Divider
            type="vertical"
            style={{
              height: _window!.innerHeight - 160,
            }}
          />
        </Col>
        <Col
          span={17}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {selectWalletOption == "" ? (
            <></>
          ) : (
            <Card
              style={{
                width: 500,
              }}
              styles={{
                body: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                },
              }}
            >
              <Typography.Title level={2}>{getTitle()}</Typography.Title>
              <Form
                form={form}
                labelCol={{
                  flex: 100,
                }}
                labelAlign="left"
                labelWrap
                wrapperCol={{
                  flex: 1,
                }}
                colon={false}
                onFinish={handleFinish}
              >
                <Form.Item
                  label={
                    <Typography.Text
                      style={{ fontSize: 25, alignItems: "center" }}
                    >
                      Amount
                    </Typography.Text>
                  }
                  name="amount"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <InputNumber
                      prefix="₱"
                      size="large"
                      style={{ width: 280 }}
                      min={1}
                      onChange={(value: number | null) => setAmount(value ?? 0)}
                    />
                    <span style={{ textAlign: "end" }}>+₱{getFee()} (fee)</span>
                  </div>
                </Form.Item>
                <Form.Item
                  label={
                    <Typography.Text
                      style={{ fontSize: 25, alignItems: "center" }}
                    >
                      Mobile Number
                    </Typography.Text>
                  }
                  name="phone"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const reg = /^9\d{9}$/;
                        const number = getFieldValue("phone");
                        if (!/^9/.test(number)) {
                          return Promise.reject("Number should start of 9");
                        } else if (!reg.test(number)) {
                          return Promise.reject("Number is invalid");
                        } else if (number.length < 10) {
                          return Promise.reject(
                            "Number should have a length of 10"
                          );
                        } else return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    prefix="+63"
                    size="large"
                    style={{ width: 280 }}
                    maxLength={10}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <Typography.Text
                      style={{ fontSize: 25, alignItems: "center" }}
                    >
                      Name
                    </Typography.Text>
                  }
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Name is blank. Please provide.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    style={{ width: 280 }}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Item>
              </Form>
              <Divider
                style={{
                  background: "#eee",
                  margin: 0,
                }}
              />
              <span
                style={{ display: "block", textAlign: "end", fontSize: 20 }}
              >
                TOTAL - ₱{getTotal()}
              </span>
              <Button
                style={{
                  display: "block",
                  fontSize: 25,
                  color: "#fff",
                  background: "#1777FF",
                  height: 50,
                }}
                onClick={form.submit}
              >
                Request
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </Drawer>
  );
};

export default GcashForm;
