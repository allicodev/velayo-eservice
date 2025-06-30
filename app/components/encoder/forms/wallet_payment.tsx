import React, { ReactNode, useEffect, useRef, useState } from "react";
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
  Modal,
  AutoComplete,
  Popconfirm,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import type { CollapseProps } from "antd";

import {
  BillingsFormField,
  CreditProp,
  GcashCollapseItemButtonProps,
  Log,
  ThresholdFees,
  UserCreditData,
  Wallet,
  WalletType,
} from "@/types";

// todo: auto disable wallet buttons when disabled by encoder (pusher)

import WalletService from "@/provider/wallet.service";
import EtcService from "@/provider/etc.service";
import { FloatLabel } from "@/assets/ts";
import { useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import CreditService from "@/provider/credit.service";
import LogService from "@/provider/log.service";
import { newLog } from "@/app/state/logs.reducers";
import FeeService from "@/provider/fee.service";

const WalletForm = ({ open, close }: { open: boolean; close: () => void }) => {
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
  const [openCredit, setOpenCredit] = useState(false);
  const [users, setUsers] = useState<UserCreditData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCreditData | null>(null);
  const [_selectedUser, _setSelectedUser] = useState<UserCreditData | null>(
    null
  );
  const [interest, setInterest] = useState<number | null>(null);

  const [credit, setCredit] = useState<CreditProp>({
    isCredit: false,
    userId: "",
    transactionId: "",
    amount: 0,
  });
  const [thresholds, setThresholds] = useState<ThresholdFees[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dispatch = useDispatch();

  // for reference tracker
  const { currentUser, currentBranch } = useUserStore();

  const processWithTotal = (u: UserCreditData): UserCreditData => {
    u.availableCredit =
      u.history == null || u.history.length == 0
        ? u.maxCredit
        : u.history.reduce(
            (p, n) =>
              p -
              (n.status == "completed"
                ? 0
                : n.history.reduce(
                    (pp, nn) => pp + parseFloat(nn.amount.toString()),
                    0
                  )),
            u.maxCredit
          );

    return u;
  };

  const runTimer = (searchWord: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => searchUser(searchWord), 100);
  };

  const searchUser = async (searchWord: string) => {
    let res = await CreditService.getUser({ searchWord });

    if (res?.success ?? false) {
      setUsers(res?.data?.map((e) => processWithTotal(e)) ?? []);
    }
  };

  // for dynamic formfields
  const selectedFormFields = () =>
    walletType == "cash-in"
      ? selectedWallet?.cashInFormField
      : selectedWallet?.cashOutFormField;

  const getFee = () => {
    if (selectedWallet?.type && selectedWallet.type == "fixed-percentage") {
      if (walletType == "cash-in") {
        return Math.ceil(
          selectedWallet?.cashinType == "fixed"
            ? selectedWallet?.cashinFeeValue!
            : amount * (selectedWallet?.cashinFeeValue! / 100)
        );
      } else {
        return selectedWallet?.cashoutType == "fixed"
          ? selectedWallet?.cashoutFeeValue!
          : Math.ceil(amount * (selectedWallet?.cashoutFeeValue! / 100));
      }
    } else {
      const filteredThresholds = thresholds.filter(
        (e) => e.subType == walletType
      );

      const fee = filteredThresholds.find(
        (e) => amount >= e.minAmount && amount <= e.maxAmount
      );
      if (!fee) return 0;

      return fee?.charge ?? 0;
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

  const updateCredit = (key: string, value: any) =>
    setCredit({ ...credit, [key]: value });

  const handleFinish = async (val: any) => {
    val = { ...val, fee: `${getFee()}_money` };
    if (includeFee) val.amount = `${amount - getFee()}_money`;

    // add validation for cashout
    if (walletType == "cash-out" && !credit.isCredit) {
      let res = await EtcService.getTransactionFromTraceId(val?.traceId);
      if (res?.success) {
        if (res?.data) {
          message.error("Transaction is already processed. Cannot continue.");
          return;
        }
      }
    }

    if (credit.isCredit) {
      if (selectedUser == null) {
        message.warning("No selected user");
        return;
      }

      if (getTotal() > selectedUser.availableCredit) {
        message.error("Cannot proceed. User Credit is insufficient");
        return;
      }
    }

    return new Promise<string | null>(async (resolve, reject) => {
      if (credit.isCredit && selectedUser != null) {
        // get user credit via id
        let userCredit = await CreditService.getUser({
          _id: selectedUser?._id ?? "",
        });

        let _res = await LogService.newLog({
          userId: currentUser?._id ?? "",
          type: "credit",
          branchId: currentBranch,
          userCreditId: selectedUser._id,
          status: "pending",
          amount: getTotal(),
          dueDate: dayjs().add((userCredit.data![0] as any).creditTerm, "day"),
          interest,
          history: [
            {
              amount: getTotal(),
              date: new Date(),
              description: "Credit Initial",
            },
          ],
        });

        return resolve(_res.data?._id ?? "");
      } else {
        return resolve(null);
      }
    }).then(async (e) => {
      setLoading(true);
      let res = await WalletService.requestWalletTransaction(
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
        selectedWallet?._id,
        e
      );

      if (res?.success ?? false) {
        setLoading(false);
        message.success(res?.message ?? "Success");
        form.resetFields();
        setSelectedWallet(null);
        setWalletType(null);
        setAmount(0);
        setIncludeFee(false);

        if (credit.isCredit && selectedUser != null) {
          await LogService.updateLog({
            _id: e,
            transactionId: res.data?._id ?? "",
          });
        }

        // creating a log for cash box
        const { success, data } = await LogService.newLog({
          type: "disbursement",
          subType: "transaction",
          transactionId: res.data?._id ?? "",
          userId: currentUser?._id ?? "",
          branchId: currentBranch,
          amount:
            (includeFee ? amount - getFee() : amount) *
            (walletType == "cash-out" ? -1 : 1),
        });

        if (success ?? false) {
          (data as any).transactionId = res.data;
          dispatch(newLog({ key: "cash", log: data as Log }));
        }

        setSelectedUser(null);
        _setSelectedUser(null);
        updateCredit("isCredit", false);
        close();
      } else setLoading(false);
    });
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

  const showCreditForm = () => {
    if (selectedUser) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#5999ff",
            padding: 10,
            color: "#fff",
            borderRadius: 10,
            marginLeft: 24,
            marginRight: 24,
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <div>
            <Typography.Title level={3} style={{ color: "#fff" }}>
              Payment Credit Applied for:{" "}
            </Typography.Title>
            <span
              style={{
                fontSize: "1.7em",
              }}
            >
              {selectedUser.name +
                " " +
                selectedUser.middlename +
                " " +
                selectedUser.lastname}
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Available Credit: ₱
              {selectedUser.availableCredit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Due Date:{" "}
              {dayjs()
                .add(selectedUser.creditTerm, "day")
                .format("MMM DD, YYYY")}{" "}
              ({selectedUser.creditTerm} days)
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Overdue Interest: {interest}% / day
            </span>
          </div>
          <Popconfirm
            title="Remove Credit"
            description="Are you sure you want to remove?"
            okText="Remove"
            onConfirm={() => {
              setSelectedUser(null);
              _setSelectedUser(null);
              updateCredit("isCredit", false);
            }}
          >
            <Button
              type="text"
              size="large"
              icon={<DeleteOutlined />}
              style={{ background: "#fff" }}
              danger
            >
              remove
            </Button>
          </Popconfirm>
        </div>
      );
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
      let res = await WalletService.getWallet();

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

    if (open) {
      getWallets();

      if (selectedWallet && selectedWallet.type == "threshold") {
        (async (_) => {
          let res = await _.getFeeThreshold("wallet", selectedWallet._id!);

          if (res?.success ?? false) setThresholds(res?.data ?? []);
        })(FeeService);
      }
    }
  }, [open, selectedWallet]);

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
                {walletType == "cash-out" && !credit.isCredit && (
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
                          width: "10f0%",
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
              {selectedUser == null && walletType == "cash-in" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    paddingLeft: 24,
                    paddingRight: 24,
                  }}
                  onClick={() => {
                    if (amount > 0) {
                      updateCredit("isCredit", !credit.isCredit);
                      setOpenCredit(true);
                    } else {
                      message.warning(
                        "Cannot proceed to credit if amount is empty."
                      );
                    }
                  }}
                >
                  <Checkbox
                    className="customCheckbox"
                    checked={credit.isCredit}
                  />
                  <span
                    style={{
                      fontSize: "2em",
                      marginLeft: 10,
                    }}
                  >
                    Apply Credit
                  </span>
                </div>
              )}
              {credit.isCredit && showCreditForm()}
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
                    visibility: credit.isCredit ? "hidden" : "visible",
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

      {/* context */}
      <Modal
        open={openCredit}
        onCancel={() => {
          setOpenCredit(false);
          updateCredit("isCredit", false);
          _setSelectedUser(null);
        }}
        footer={null}
        closable={false}
        destroyOnClose
      >
        <AutoComplete
          size="large"
          className="ctmFontSize"
          placeholder="Search User"
          style={{
            width: "100%",
            height: 50,
            fontSize: "1.5em",
            marginTop: 10,
          }}
          filterOption={(inputValue, option) =>
            option!
              .value!.toString()
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
          options={users
            // .filter((e) => selectedItem.map((_) => _._id).some((_) => _ == e._id)) // ! not working
            .map((e) => ({
              label: (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{e.name + " " + e.middlename + " " + e.lastname}</span>
                  <span>
                    Available Credits:{" "}
                    <strong>
                      ₱
                      {e.availableCredit?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                </div>
              ),
              value: e.name + " " + e.middlename + " " + e.lastname,
              key: e._id,
            }))}
          onChange={(e) => {
            if (e != "") {
              runTimer(e);
            } else setSelectedUser(null);
          }}
          onSelect={(_, __) => {
            if (
              users.filter((e) => e._id == __.key)[0].availableCredit -
                getTotal() >
              0
            )
              _setSelectedUser(users.filter((e) => e._id == __.key)[0]);
            else
              message.error(
                "Credit cannot applied. Max Credits already reached"
              );
          }}
          autoFocus
        />
        {_selectedUser != null && (
          <div
            style={{
              fontSize: "1.5em",
              marginTop: 10,
              gap: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Overdue Interest per day:</span>
            <InputNumber
              style={{
                width: 100,
              }}
              controls={false}
              onChange={(e) => {
                if (e != null && e != "")
                  setInterest(parseFloat(e.toLocaleString()));
                else setInterest(null);
              }}
              onPressEnter={() => {
                setOpenCredit(false);
                setSelectedUser(_selectedUser);
              }}
              size="large"
              addonAfter="%"
            />
          </div>
        )}
        <Button
          size="large"
          type="primary"
          style={{ marginTop: 10 }}
          disabled={_selectedUser == null || interest == null}
          onClick={() => {
            setOpenCredit(false);
            setSelectedUser(_selectedUser);
          }}
          block
        >
          CONFIRM
        </Button>
      </Modal>
    </Drawer>
  );
};

export default WalletForm;
