import React, { ReactNode, useEffect, useState } from "react";
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
  Checkbox,
  Select,
  message,
  Tooltip,
} from "antd";
import type { CollapseProps } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import {
  BillingsFormField,
  DrawerBasicProps,
  GcashCollapseItemButtonProps,
  Wallet,
  WalletType,
} from "@/types";

import WalletService from "@/provider/wallet.service";
import { FloatLabel } from "@/assets/ts";

const WalletForm = ({ open, close }: DrawerBasicProps) => {
  const wallet = new WalletService();

  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [form] = Form.useForm();
  const [amount, setAmount] = useState(0);
  const [includeFee, setIncludeFee] = useState(false);

  // for dynamic formfields
  const selectedFormFields = () =>
    walletType == "cash-in"
      ? selectedWallet?.cashInFormField
      : selectedWallet?.cashOutFormField;

  const getFee = () => {
    if (walletType == "cash-in") {
      return selectedWallet?.cashinType == "fixed"
        ? selectedWallet?.cashinFeeValue!
        : amount * (selectedWallet?.cashinFeeValue! / 100);
    } else {
      return selectedWallet?.cashoutType == "fixed"
        ? selectedWallet?.cashoutFeeValue!
        : amount * (selectedWallet?.cashoutFeeValue! / 100);
    }
  };

  const getTotal = () => {
    if (includeFee) return amount;
    else return amount + getFee();
  };

  const handleFinish = (val: any) => {
    val = { ...val, fee: `${getFee()}_money` };
    if (includeFee) val.amount = `${amount - getFee()}_money`;

    (async (_) => {
      let res = await _.requestWalletTransaction(
        `${selectedWallet!.name!} ${walletType}`,
        JSON.stringify({
          ...val,
          billerId: selectedWallet?._id,
          transactionType: "wallet",
        }),
        includeFee ? amount - getFee() : amount,
        getFee()
      );

      if (res?.success ?? false) {
        message.success(res?.message ?? "Success");
        form.resetFields();
        close();
      }
    })(wallet);
  };

  const toCollapsibleItemButton = ({
    wallet,
    onClickTitle,
    onClickCashIn,
    onClickCashOut,
  }: GcashCollapseItemButtonProps) => {
    return {
      key: wallet._id,
      label: (
        <Tooltip
          title={
            wallet.isDisabled ? "This Wallet has been disabled by encoder" : ""
          }
        >
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
            disabled={wallet.isDisabled}
          >
            {wallet.name.toLocaleUpperCase()}
          </Button>
        </Tooltip>
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
                ...(walletType == "cash-in"
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
                ...(walletType == "cash-out"
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

  const renderFormFieldSpecific = (ff: BillingsFormField | null): ReactNode => {
    if (ff) {
      switch (ff.type) {
        case "input": {
          return (
            <Form.Item
              name={ff.slug_name}
              rules={[{ required: true }]}
              key={ff.slug_name}
              style={{
                margin: 0,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
              >
                <Input
                  size="large"
                  minLength={ff.inputOption?.minLength ?? undefined}
                  maxLength={ff.inputOption?.minLength ?? undefined}
                  className="customInput"
                  onChange={(e) =>
                    form.setFieldsValue({ [ff.slug_name!]: e.target.value })
                  }
                />
              </FloatLabel>
            </Form.Item>
          );
        }

        case "number": {
          return (
            <Form.Item
              name={ff.slug_name}
              rules={[{ required: true }]}
              key={ff.slug_name}
              style={{
                margin: 0,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
                extra={
                  ff.inputNumberOption?.mainAmount && (
                    <span style={{ float: "right", marginBottom: 10 }}>
                      +₱{getFee().toLocaleString()} (fee)
                    </span>
                  )
                }
              >
                <InputNumber
                  size="large"
                  controls={false}
                  prefix={ff.inputNumberOption?.isMoney ? "₱" : ""}
                  style={{ width: "100%" }}
                  min={ff.inputNumberOption?.min ?? undefined}
                  max={ff.inputNumberOption?.max ?? undefined}
                  className={`customInput ${
                    ff.inputNumberOption?.isMoney ? "" : "no-prefix"
                  }`}
                  formatter={(value: any) =>
                    ff.inputNumberOption?.isMoney
                      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : value
                  }
                  parser={(value: any) =>
                    ff.inputNumberOption?.isMoney
                      ? value.replace(/\$\s?|(,*)/g, "")
                      : value
                  }
                  onChange={(e) => {
                    form.setFieldsValue({
                      [ff.slug_name!]:
                        e + (ff.inputNumberOption?.isMoney ? "_money" : null),
                    });
                    if (ff.inputNumberOption?.mainAmount) setAmount(e);
                  }}
                />
              </FloatLabel>
            </Form.Item>
          );
        }

        case "textarea": {
          return (
            <Form.Item
              name={ff.slug_name}
              rules={[{ required: true }]}
              style={{
                margin: 0,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
              >
                <Input.TextArea
                  size="large"
                  className="customInput"
                  onChange={(e) =>
                    form.setFieldsValue({ [ff.slug_name!]: e.target.value })
                  }
                  autoSize={{
                    minRows: ff.textareaOption?.minRow ?? undefined,
                    maxRows: ff.textareaOption?.maxRow ?? undefined,
                  }}
                />
              </FloatLabel>
            </Form.Item>
          );
        }

        case "checkbox": {
          return (
            <Form.Item name={ff.slug_name} valuePropName="checked" noStyle>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Typography.Paragraph
                  style={{
                    fontSize: 18,
                    maxWidth: 100,
                    margin: 0,
                    marginRight: 10,
                  }}
                  ellipsis={true}
                >
                  {ff.name}
                </Typography.Paragraph>
                <Checkbox
                  onChange={(e) =>
                    form.setFieldsValue({ [ff.slug_name!]: e.target.checked })
                  }
                />
              </div>
            </Form.Item>
          );
        }

        case "select": {
          return (
            <Form.Item
              name={ff.slug_name}
              rules={[{ required: true }]}
              style={{
                margin: 0,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
              >
                <Select
                  options={ff.selectOption?.items?.map((e) => {
                    return {
                      label: e.name,
                      value: e.value,
                    };
                  })}
                  size="large"
                  onChange={(e) => form.setFieldsValue({ [ff.slug_name!]: e })}
                />
              </FloatLabel>
            </Form.Item>
          );
        }
      }
    } else return <></>;
  };

  const onClickCashIn = () => {
    setWalletType("cash-in");
    form.resetFields();
  };
  const onClickCashOut = () => {
    setWalletType("cash-out");
    form.resetFields();
  };
  const items: CollapseProps["items"] = wallets.map((e) =>
    toCollapsibleItemButton({ wallet: e, onClickCashIn, onClickCashOut })
  );
  const getTitle = () =>
    `${selectedWallet?.name} ${
      walletType == "cash-in" ? "Cash-in" : "Cash-out"
    }`;

  const getWallets = () => {
    (async (_) => {
      let res = await _.getWallet();

      if (res.success) {
        setWallets(res?.data ?? []);
      }
    })(wallet);
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
        setWalletType(null);
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
            onChange={() => setWalletType(null)}
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
          {walletType == null ? (
            <></>
          ) : (
            <Card
              style={{
                width: 700,
              }}
              styles={{
                body: {
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                },
              }}
            >
              <Typography.Text style={{ fontSize: 35 }}>
                {getTitle()}
              </Typography.Text>
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
                requiredMark={"optional"}
                onFinish={handleFinish}
              >
                {selectedFormFields()?.map((e) => renderFormFieldSpecific(e))}
              </Form>
              <Divider
                style={{
                  background: "#eee",
                  margin: 0,
                  marginTop: 50,
                }}
              />
              <div
                style={{
                  marginTop: 35,
                  marginBottom: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  onClick={(e) => setIncludeFee(!includeFee)}
                  style={{ cursor: "pointer" }}
                >
                  <Checkbox checked={includeFee} /> Include Fee
                </div>
                <span style={{ textAlign: "end", fontSize: 20 }}>
                  TOTAL • ₱{getTotal().toLocaleString()}
                </span>
              </div>

              <Button
                style={{
                  display: "block",
                  fontSize: 25,
                  color: "#fff",
                  background: "#1777FF",
                  height: 50,
                  marginTop: 25,
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

export default WalletForm;
