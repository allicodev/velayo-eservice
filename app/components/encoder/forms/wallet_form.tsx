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
  Alert,
} from "antd";
import type { CollapseProps } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import {
  BillingsFormField,
  GcashCollapseItemButtonProps,
  Wallet,
  WalletType,
} from "@/types";

// todo: auto disable wallet buttons when disabled by encoder (pusher)

import WalletService from "@/provider/wallet.service";
import EtcService from "@/provider/etc.service";
import { FloatLabel } from "@/assets/ts";
import { useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";

const WalletForm = ({ open, close }: { open: boolean; close: () => void }) => {
  const wallet = new WalletService();
  const etc = new EtcService();

  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [form] = Form.useForm();
  const [amount, setAmount] = useState(0);
  const [includeFee, setIncludeFee] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  // for reference tracker

  const { currentUser, currentBranch } = useUserStore();

  // for dynamic formfields
  const selectedFormFields = () =>
    walletType == "cash-in"
      ? selectedWallet?.cashInFormField
      : selectedWallet?.cashOutFormField;

  const getFee = () => {
    if (walletType == "cash-in") {
      return Math.ceil(
        selectedWallet?.cashinType == "fixed"
          ? selectedWallet?.cashinFeeValue!
          : amount * (selectedWallet?.cashinFeeValue! / 100)
      );
    } else {
      return selectedWallet?.cashoutType == "fixed"
        ? selectedWallet?.cashoutFeeValue!
        : includeFee
        ? amount -
          Math.ceil(amount / (1 + selectedWallet?.cashoutFeeValue! / 100))
        : Math.ceil(amount * (selectedWallet?.cashoutFeeValue! / 100));
    }
  };

  const getTotal = () => {
    if (walletType == "cash-out" && includeFee)
      return amount - getFee() < 0 ? 0 : amount - getFee();
    if (includeFee) return amount;
    else return amount + getFee();
  };

  const slugToName = (str: string) =>
    str
      .replaceAll("_", " ")
      .split(" ")
      .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
      .join(" ");

  const handleFinish = async (val: any) => {
    val = { ...val, fee: `${getFee()}_money` };
    if (includeFee) val.amount = `${amount - getFee()}_money`;

    // add validation for cashout
    if (walletType == "cash-out") {
      let res = await etc.getTransactionFromTraceId(val?.traceId);
      if (res?.success) {
        if (res?.data) {
          message.error("Transaction is already processed. Cannot continue.");
          return;
        }
      }
    }

    setLoading(true);
    let res = await wallet.requestWalletTransaction(
      `${selectedWallet!.name!} ${walletType}`,
      JSON.stringify({
        ...val,
        billerId: selectedWallet?._id,
        transactionType: "wallet",
      }),
      includeFee ? amount - getFee() : amount,
      getFee(),
      currentUser?._id ?? "",
      currentBranch,
      walletType == "cash-out" ? val?.traceId ?? "" : null,
      selectedWallet?._id
    );

    if (res?.success ?? false) {
      setLoading(false);
      message.success(res?.message ?? "Success");
      form.resetFields();
      setSelectedWallet(null);
      setWalletType(null);
      setAmount(0);
      setIncludeFee(false);
      close();
    } else setLoading(false);
  };

  const toCollapsibleItemButton = ({
    wallet,
    onClickTitle,
    onClickCashIn,
    onClickCashOut,
  }: GcashCollapseItemButtonProps) => {
    return {
      key: wallet._id,
      id: wallet.name,
      label: (
        <Tooltip
          title={
            wallet.isDisabled
              ? "This Wallet is unavailable"
              : wallet.name.length > 20
              ? wallet.name
              : ""
          }
        >
          <Button
            style={{
              width: 300,
              paddingTop: 10,
              paddingBottom: 10,
              height: 70,
              fontWeight: "bolder",
              ...(selectedWallet?._id == wallet._id
                ? {
                    background: wallet.isDisabled ? "#294B0FAA" : "#294B0F",
                    color: "#fff",
                  }
                : {
                    background: "#fff",
                    color: "#000",
                  }),
              ...(wallet.isDisabled ? { color: "#CCCCCC" } : {}),
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
            <Typography.Text
              style={{
                fontSize: 35,
                maxWidth: 270,
                ...(selectedWallet?._id == wallet._id
                  ? {
                      color: "#fff",
                    }
                  : {
                      color: "#000",
                    }),
                ...(wallet.isDisabled ? { color: "#CCCCCC" } : {}),
              }}
              ellipsis
            >
              {wallet.name.toLocaleUpperCase()}
            </Typography.Text>
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
                height: 50,
                fontSize: 25,
                fontWeight: "bolder",
                ...(walletType == "cash-in"
                  ? {
                      background: wallet.isDisabled ? "#294B0FAA" : "#294B0F",
                      color: "#fff",
                    }
                  : {
                      background: wallet.isDisabled ? "#EEE" : "#fff",
                      color: wallet.isDisabled ? "#aaa" : "#000",
                    }),
                ...(wallet.isDisabled ? { color: "#CCCCCC" } : {}),
              }}
              onClick={onClickCashIn}
              disabled={wallet.isDisabled}
            >
              cash-in
            </Button>
          </div>
          <div style={{ marginLeft: 20 }}>
            <RightOutlined style={{ marginRight: 10 }} />
            <Button
              style={{
                width: 150,
                height: 50,
                fontSize: 25,
                fontWeight: "bolder",
                ...(walletType == "cash-out"
                  ? {
                      background: wallet.isDisabled ? "#294B0FAA" : "#294B0F",
                      color: "#fff",
                    }
                  : {
                      background: wallet.isDisabled ? "#EEE" : "#fff",
                      color: wallet.isDisabled ? "#aaa" : "#000",
                    }),
                ...(wallet.isDisabled ? { color: "#CCCCCC" } : {}),
              }}
              onClick={onClickCashOut}
              disabled={wallet.isDisabled}
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
              rules={[{ required: true, message: "" }]}
              key={ff.slug_name}
              style={{
                margin: 0,
                marginBottom: 10,
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
                  className="customInput size-70"
                  style={{
                    height: 70,
                    fontSize: "2em",
                    letterSpacing: 1,
                  }}
                  onBlur={() => {
                    if (ff.inputOption?.minLength ?? false) {
                      const min = ff.inputOption?.minLength ?? 0;
                      const value = form
                        .getFieldValue(ff.slug_name)
                        ?.toString();

                      if (value?.length < min) {
                        setError({
                          ...error,
                          [ff.slug_name!]: `${slugToName(
                            ff.slug_name!
                          )} has a minimum length of ${min}`,
                        });
                        form.setFields([
                          {
                            name: ff.slug_name,
                            errors: [""],
                          },
                        ]);
                      } else {
                        const newData = { ...error };
                        delete (newData as any)[ff.slug_name!];
                        setError(newData);
                      }
                    }
                  }}
                  onChange={(e) => {
                    form.setFieldsValue({ [ff.slug_name!]: e.target.value });

                    // onchange validations
                    const min = ff.inputOption?.minLength ?? 0;
                    if (e && e.target.value.length >= min) {
                      const newData = { ...error };
                      delete (newData as any)[ff.slug_name!];
                      setError(newData);
                    }
                  }}
                />
              </FloatLabel>
            </Form.Item>
          );
        }

        case "number": {
          return (
            <Form.Item
              name={ff.slug_name}
              rules={[{ required: true, message: "" }]}
              key={ff.slug_name}
              style={{
                margin: 0,
                marginBottom: 10,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
                extra={
                  ff.inputNumberOption?.mainAmount && (
                    <span
                      style={{
                        float: "right",
                        marginBottom: 10,
                        fontSize: "1.8em",
                      }}
                    >
                      +₱{includeFee ? "0" : getFee().toLocaleString()} (fee)
                    </span>
                  )
                }
              >
                <InputNumber
                  size="large"
                  controls={false}
                  prefix={ff.inputNumberOption?.isMoney ? "₱" : ""}
                  style={{
                    width: "100%",
                    height: 70,
                    alignItems: "center",
                    fontSize: "2em",
                  }}
                  min={ff.inputNumberOption?.min ?? undefined}
                  max={ff.inputNumberOption?.max ?? undefined}
                  minLength={ff.inputNumberOption?.minLength ?? undefined}
                  maxLength={ff.inputNumberOption?.maxLength ?? undefined}
                  className={`customInput size-70 ${
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

                    // onchange validations
                    const min = ff.inputNumberOption?.minLength ?? 0;
                    if (e && e.toString().length >= min) {
                      const newData = { ...error };
                      delete (newData as any)[ff.slug_name!];
                      setError(newData);
                    }
                  }}
                  onBlur={() => {
                    if (ff.inputNumberOption?.minLength ?? false) {
                      const min = ff.inputNumberOption?.minLength ?? 0;
                      const value =
                        form.getFieldValue(ff.slug_name)?.toString() ?? "";

                      if (value.length < min) {
                        setError({
                          ...error,
                          [ff.slug_name!]: `${slugToName(
                            ff.slug_name!
                          )} has a minimum length of ${min}`,
                        });
                        form.setFields([
                          {
                            name: ff.slug_name,
                            errors: [""],
                          },
                        ]);
                      } else {
                        const newData = { ...error };
                        delete (newData as any)[ff.slug_name!];
                        setError(newData);
                      }
                    }
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
              rules={[{ required: true, message: "" }]}
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
                  className="customInput size-70"
                  onChange={(e) =>
                    form.setFieldsValue({ [ff.slug_name!]: e.target.value })
                  }
                  autoSize
                  // autoSize={{
                  //   minRows: ff.textareaOption?.minRow ?? undefined,
                  //   maxRows: ff.textareaOption?.maxRow ?? undefined,
                  // }}
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
              rules={[{ required: true, message: "" }]}
              style={{
                margin: 0,
              }}
            >
              <FloatLabel
                value={form.getFieldValue(ff.slug_name)}
                label={ff.name}
              >
                <Select
                  className="customInput size-70"
                  size="large"
                  style={{
                    height: 70,
                  }}
                  onChange={(e) => form.setFieldsValue({ [ff.slug_name!]: e })}
                >
                  {ff.selectOption?.items?.map((e) => (
                    <Select.Option
                      value={e.value}
                      style={{ fontSize: "1.5em" }}
                    >
                      {e.name}
                    </Select.Option>
                  ))}
                </Select>
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

  const getWallets = async () =>
    await new Promise(async (resolve, reject) => {
      let res = await wallet.getWallet();

      if (res?.success ?? false) {
        setWallets(res?.data ?? []);
        resolve({ wallets: res?.data ?? [], s: selectedWallet });
      } else reject();
    });

  const handleNotifyDisable = async ({ data }: { data: any[] }) => {
    setWallets(
      wallets.map((e) => {
        data.forEach((_) => {
          if (_._id == e._id) e.isDisabled = _.isDisabled;
        });
        return e;
      })
    );
    if (data.map((_) => _._id).includes(selectedWallet?._id ?? "")) {
      message.warning("This wallet has been updated");
    }
  };

  const initPusherProvider = () => {
    let channel = new Pusher().subscribe("teller-general");
    // unbind before rebinding
    try {
      channel.unbind("notify-disabled-wallet");
    } catch {}

    channel.bind("notify-disabled-wallet", handleNotifyDisable);
    return () => {
      channel.unsubscribe();
    };
  };

  useEffect(() => {
    return initPusherProvider();
  }, [selectedWallet, wallets]);

  useEffect(() => {
    setWindow(window);

    if (open) getWallets();
  }, [open]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        setSelectedWallet(null);
        setWalletType(null);
        setAmount(0);
        setIncludeFee(false);
        setError({});
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
      styles={{
        body: {
          overflow: "hidden",
        },
      }}
    >
      <Row>
        <Col span={6}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: 300,
              marginLeft: 15,
              // position: "absolute",
              // top: 0,
              // left: 0,
              // zIndex: 9999,
            }}
          >
            <Input
              size="large"
              placeholder="Search/Filter Wallet"
              value={searchKey}
              onChange={(e) => {
                setSearchKey(e.target.value);
                setError({});
              }}
              style={{
                width: "98%",
                marginRight: "2%",
                height: 50,
                fontSize: 25,
              }}
            />
            <Tooltip title="Reset">
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => setSearchKey("")}
                style={{
                  height: 50,
                  width: 50,
                }}
              />
            </Tooltip>
          </div>
          <div
            className="no-scrollbar"
            style={{
              overflow: "scroll",
              maxHeight: "77vh",
              paddingBottom: 30,
            }}
          >
            <Collapse
              onChange={() => setWalletType(null)}
              style={{
                background: "#fff",
              }}
              items={
                searchKey == ""
                  ? items
                  : items.filter((e) =>
                      e.id
                        ?.toString()
                        .toLocaleLowerCase()
                        .includes(searchKey.toLocaleLowerCase())
                    )
              }
              bordered={false}
              destroyInactivePanel
              activeKey={selectedWallet?._id}
              accordion
            />
          </div>
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
          className={
            wallets.filter((e) => selectedWallet?._id == e._id).length > 0 &&
            wallets.filter((e) => selectedWallet?._id == e._id)[0].isDisabled
              ? "disable-content"
              : ""
          }
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {walletType == null ? (
            <></>
          ) : selectedFormFields() != undefined &&
            selectedFormFields()!.length > 0 ? (
            <Card
              style={{
                minWidth: 700,
                height: "80vh",
              }}
              styles={{
                body: {
                  display: "flex",
                  flexDirection: "column",
                  height: "77vh",
                  overflow: "scroll",
                  padding: 0,
                },
              }}
              classNames={{
                body: "no-scrollbar",
              }}
            >
              <div
                style={{
                  position: "sticky",
                  width: "100%",
                  top: 0,
                  left: 0,
                  background: "#fff",
                  zIndex: 999999,
                  border: "1px solid #ccc",
                }}
              >
                <Typography.Text
                  style={{
                    fontSize: 45,
                    display: "block",
                    textAlign: "center",
                    textWrap: "nowrap",
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                >
                  {getTitle()}
                </Typography.Text>
              </div>

              {Object.values(error).length > 0 && (
                <Alert
                  type="error"
                  style={{ marginBottom: 25, fontSize: "1.4em", margin: 24 }}
                  message={
                    <Space direction="vertical" size={[0, 1]}>
                      {Object.values(error).map((e: any) => (
                        <span>{e}</span>
                      ))}
                    </Space>
                  }
                />
              )}
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
                style={{
                  padding: 24,
                }}
                colon={false}
                requiredMark={"optional"}
                onFinish={handleFinish}
              >
                <div
                  style={
                    selectedWallet?.isDisabled
                      ? {
                          pointerEvents: "none",
                          userSelect: "none",
                          touchAction: "none",
                        }
                      : {}
                  }
                >
                  {selectedFormFields()?.map((e) => renderFormFieldSpecific(e))}
                </div>
                {walletType == "cash-out" && (
                  <div>
                    <div
                      style={{
                        fontSize: "1.5em",
                      }}
                    >
                      <QuestionCircleOutlined style={{ marginBottom: 10 }} />{" "}
                      Reference Number (date, time, last 4 digits) (e.g
                      2312121234)
                    </div>
                    <Form.Item
                      name="traceId"
                      key="traceId"
                      rules={[{ required: true, message: "" }]}
                      style={{
                        margin: 0,
                        marginBottom: 10,
                      }}
                    >
                      <Input
                        size="large"
                        className="customInput size-70"
                        minLength={10}
                        maxLength={10}
                        style={{
                          width: "100%",
                          height: 70,
                          fontSize: "2em",
                        }}
                        onKeyDown={(e) => {
                          const charCode = e.which || e.keyCode;
                          if (
                            charCode != 8 &&
                            charCode != 37 &&
                            charCode != 39
                          ) {
                            if (charCode < 48 || charCode > 57) {
                              e.preventDefault();
                            }
                          }
                        }}
                        onChange={(e) =>
                          form.setFieldsValue({
                            traceId: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </div>
                )}
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
                  paddingLeft: 24,
                  paddingRight: 24,
                }}
              >
                <div
                  onClick={(e) => setIncludeFee(!includeFee)}
                  style={{
                    display: "flex",
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={includeFee}
                    className="customCheckbox"
                    style={{ marginRight: 10 }}
                  />{" "}
                  <span
                    style={{
                      fontSize: "2em",
                    }}
                  >
                    Include Fee
                  </span>
                </div>
                <span style={{ textAlign: "end", fontSize: "2em" }}>
                  TOTAL • ₱{getTotal()?.toLocaleString()}
                </span>
              </div>

              <Button
                style={{
                  display: "block",
                  fontSize: 35,
                  color: "#fff",
                  background: "#1777FF",
                  height: 70,
                  marginTop: 25,
                  marginLeft: 24,
                  marginRight: 24,
                }}
                onClick={form.submit}
                loading={loading}
              >
                CONFIRM
              </Button>
            </Card>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: "2em" }}>
              There are no Form Fields added on this Wallet
            </Typography.Text>
          )}
        </Col>
      </Row>
    </Drawer>
  );
};

export default WalletForm;
