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

import { DrawerBasicProps, GcashCollapseItemButtonProps } from "@/types";

const GcashForm = ({ open, close }: DrawerBasicProps) => {
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectWalletOption, setSelectedWalletOption] = useState("");
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [form] = Form.useForm();

  const [amount, setAmount] = useState(0);

  const onClickCashIn = () => setSelectedWalletOption("cashin");
  const onClickCashOut = () => setSelectedWalletOption("cashout");

  const toCollapsibleItemButton = ({
    key,
    label,
    onClickTitle,
    onClickCashIn,
    onClickCashOut,
  }: GcashCollapseItemButtonProps) => {
    if (!key) key = label;

    return {
      key,
      label: (
        <Button
          style={{
            width: 300,
            fontSize: 35,
            paddingTop: 10,
            paddingBottom: 10,
            height: 70,
            ...(selectedWallet == key
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
            if (key == selectedWallet) {
              setSelectedWallet("");
            } else {
              setSelectedWallet(key!);
              if (onClickTitle) onClickTitle(label);
            }
          }}
        >
          {label.toLocaleUpperCase()}
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

  const items: CollapseProps["items"] = [
    "gcash",
    "maya",
    "palawan pay",
    "unionbank",
  ].map((e) =>
    toCollapsibleItemButton({ label: e, onClickCashIn, onClickCashOut })
  );

  const getTitle = () =>
    `${selectedWallet.toLocaleUpperCase()} ${
      selectWalletOption == "cashin" ? "Cash-in" : "Cash-out"
    }`;

  const getFee = () => (amount * 0.02).toFixed(2);
  const getTotal = () => (amount + +getFee()).toFixed(2);

  useEffect(() => {
    setWindow(window);
  }, []);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedWallet("");
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
            activeKey={selectedWallet}
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
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <InputNumber
                      prefix="₱"
                      size="large"
                      style={{ width: 280 }}
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
                >
                  <Input prefix="+63" size="large" style={{ width: 280 }} />
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
                >
                  <Input size="large" style={{ width: 280 }} />
                </Form.Item>
              </Form>
              <Divider
                style={{
                  background: "#000",
                  marginTop: 24,
                  marginBottom: 10,
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
