import React, { useEffect, useState, ReactNode, useRef } from "react";
import {
  Drawer,
  Typography,
  Row,
  Col,
  Divider,
  Button,
  Space,
  Form,
  Input,
  Card,
  InputNumber,
  Checkbox,
  Select,
  message,
  Tooltip,
  Alert,
  AutoComplete,
  Modal,
  Popconfirm,
  Spin,
} from "antd";
import {
  LeftOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  BillingSettingsType,
  DrawerBasicProps,
  BillButtonProps,
  BillingsFormField,
  OnlinePayment,
  CreditProp,
  UserCreditData,
} from "@/types";
import BillService from "@/provider/bill.service";
import { FloatLabel } from "@/assets/ts";
import { useUserStore } from "@/provider/context";
import EtcService from "@/provider/etc.service";
import { Pusher } from "@/provider/utils/pusher";
import CreditService from "@/provider/credit.service";
import LogService from "@/provider/log.service";
import dayjs from "dayjs";

// TODO: auto disabled billing if disabled by encoder
// TODO: auto disabled wallet if disabled by encoder

//* component helper
const BillButton = ({
  bill,
  isSelected,
  onSelected,
  disabled,
}: BillButtonProps) => {
  return (
    <Tooltip title={disabled ? "This biller is unavailable" : ""}>
      <Button
        size="large"
        style={{
          width: 300,
          paddingTop: 10,
          paddingBottom: 10,
          height: 70,
          ...(isSelected
            ? {
                background: disabled ? "#294B0FAA" : "#294B0F",
              }
            : {
                background: "#fff",
              }),
          ...(disabled ? { color: "#CCCCCC" } : {}),
        }}
        onClick={() => onSelected(bill)}
        disabled={disabled}
        block
      >
        <Tooltip title={bill.name.length > 20 ? bill.name : ""}>
          <Typography.Text
            style={{
              fontSize: 35,
              ...(isSelected ? { color: "#fff" } : { color: "#000" }),
              ...(disabled ? { color: "#CCCCCC" } : {}),
              maxWidth: 270,
            }}
            ellipsis
          >
            {bill.name}
          </Typography.Text>
        </Tooltip>
      </Button>
    </Tooltip>
  );
};

const BillsPayment = ({ open, close }: DrawerBasicProps) => {
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [bills, setBills] = useState<BillingSettingsType[]>([]);
  const [amount, setAmount] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState({});
  const [users, setUsers] = useState<UserCreditData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCreditData | null>(null);
  const [_selectedUser, _setSelectedUser] = useState<UserCreditData | null>(
    null
  );
  const [interest, setInterest] = useState<number | null>(null);
  const [inputSearch, setInputSearch] = useState("");
  const [openCredit, setOpenCredit] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillingSettingsType | null>(
    null
  );
  const [onlinePaymentInput, setOnlinePaymentInput] = useState<OnlinePayment>({
    isOnlinePayment: false,
    portal: "",
    receiverName: "",
    recieverNum: "",
    traceId: "",
  });
  const [credit, setCredit] = useState<CreditProp>({
    isCredit: false,
    userId: "",
    transactionId: "",
    amount: 0,
  });

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);

  const updateOP = (key: string, value: any) =>
    setOnlinePaymentInput({ ...onlinePaymentInput, [key]: value });
  const updateCredit = (key: string, value: any) =>
    setCredit({ ...credit, [key]: value });

  const runTimer = (searchWord: string) => {
    setInputSearch(searchWord);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => searchUser(searchWord), 100);
  };

  const { currentUser, currentBranch } = useUserStore();

  const getFee = () => {
    if (selectedBill) {
      const { threshold, additionalFee, fee } = selectedBill;

      if (amount / threshold > 0) {
        let multiplier = Math.floor(amount / threshold);
        return fee + additionalFee * multiplier;
      } else return fee;
    }
    return 0;
  };

  const getTotal = () => amount + getFee();

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

  const slugToName = (str: string) =>
    str
      .replaceAll("_", " ")
      .split(" ")
      .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
      .join(" ");

  const searchUser = async (searchWord: string) => {
    let res = await CreditService.getUser({ searchWord });

    if (res?.success ?? false) {
      setUsers(res?.data?.map((e) => processWithTotal(e)) ?? []);
    }
  };

  const handleFinish = async (val: any) => {
    let isError = false;
    if (onlinePaymentInput.isOnlinePayment) {
      await form2.validateFields().catch(() => {
        isError = true;
      });

      if (onlinePaymentInput.traceId.length < 10) {
        message.warning("Trace ID should have a length of 10");
        return;
      }
    }
    if (onlinePaymentInput.isOnlinePayment && isError) {
      return;
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

    const func = () => {
      val = { ...val, fee: `${getFee()}_money` };
      (async (_) => {
        if (selectedBill) {
          setLoading(true);

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
                dueDate: dayjs().add(
                  (userCredit.data![0] as any).creditTerm,
                  "day"
                ),
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
            let res = await _.requestBill(
              selectedBill?.name,
              JSON.stringify({
                ...val,
                billerId: selectedBill._id,
                transactionType: "biller",
              }),
              amount,
              getFee(),
              currentUser?._id ?? "",
              currentBranch,
              onlinePaymentInput.isOnlinePayment && !isError
                ? onlinePaymentInput
                : undefined,
              selectedBill._id,
              e
            );

            if (res.success) {
              setLoading(false);
              setSelectedBill(null);
              setOnlinePaymentInput({
                isOnlinePayment: false,
                portal: "",
                receiverName: "",
                recieverNum: "",
                traceId: "",
              });
              message.success(res?.message ?? "Success");
              form.resetFields();
              form2.resetFields();

              if (credit.isCredit && selectedUser != null) {
                await LogService.updateLog({
                  _id: e,
                  transactionId: res.data?._id ?? "",
                });
              }
              setSelectedUser(null);
              _setSelectedUser(null);
              updateCredit("isCredit", false);
              close();
            } else setLoading(false);
          });
        }
      })(BillService);
    };

    // if isOnlinepayment is true, check for traceid
    if (onlinePaymentInput.isOnlinePayment)
      return await new Promise(async (resolve, reject) => {
        await EtcService.getTransactionFromTraceId(
          onlinePaymentInput.traceId
        ).then((e) => (e?.data ? resolve(e.data) : reject()));
      })
        .then((e) => {
          if (e)
            message.warning(
              "Transaction is already processed. Cannot continue."
            );
          return;
        })
        .catch(() => {
          func();
          return;
        });
    func();
  };

  const showOnlineForm = () => (
    <Form
      form={form2}
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: 20,
        gap: 10,
      }}
    >
      <Form.Item
        rules={[
          {
            required: true,
            message: "Portal is required. Please provide",
          },
        ]}
        name="portal"
        noStyle
      >
        <FloatLabel
          value={onlinePaymentInput.portal}
          label="Portal (Payment Wallet Used)"
        >
          <Input
            className="customInput size-70"
            value={onlinePaymentInput.portal}
            style={{
              height: 70,
              fontSize: "2em",
            }}
            onChange={(e) => {
              updateOP("portal", e.target.value);
              form2.setFieldValue("portal", e.target.value);
            }}
          />
        </FloatLabel>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: "Sender Name is required. Please provide",
          },
        ]}
        name="receiverName"
        noStyle
      >
        <FloatLabel
          value={onlinePaymentInput.receiverName}
          label="Sender Name (Payees name of payment wallet being sent)"
        >
          <Input
            className="customInput size-70"
            value={onlinePaymentInput.receiverName}
            style={{
              height: 70,
              fontSize: "2em",
            }}
            onChange={(e) => {
              updateOP("receiverName", e.target.value);
              form2.setFieldValue("receiverName", e.target.value);
            }}
          />
        </FloatLabel>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: "Sender Number is required. Please provide",
          },
        ]}
        name="recieverNum"
        noStyle
      >
        <FloatLabel
          value={onlinePaymentInput.recieverNum}
          label="Sender Number/Account Number"
        >
          <Input
            className="customInput size-70"
            value={onlinePaymentInput.recieverNum}
            style={{
              height: 70,
              fontSize: "2em",
            }}
            onChange={(e) => {
              updateOP("recieverNum", e.target.value);
              form2.setFieldValue("recieverNum", e.target.value);
            }}
          />
        </FloatLabel>
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
            message: "Trace ID is required. Please provide",
          },
        ]}
        name="traceId"
        noStyle
      >
        <FloatLabel
          value={onlinePaymentInput.traceId}
          label="Trace ID (date, time, last 4 digits) (e.g 2312121234)"
        >
          <Input
            className="customInput size-70"
            value={onlinePaymentInput.traceId}
            maxLength={10}
            minLength={10}
            style={{
              height: 70,
              fontSize: "2em",
            }}
            onChange={(e) => {
              if (e.target.value == "") {
                updateOP("traceId", "");
                form2.setFieldValue("traceId", "");
              }

              if (!Number.isNaN(Number(e.target.value))) {
                updateOP("traceId", e.target.value);
                form2.setFieldValue("traceId", e.target.value);
              }
            }}
          />
        </FloatLabel>
      </Form.Item>
    </Form>
  );

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

  const renderSelectedBill = (bill: BillingSettingsType | null): ReactNode => {
    const renderFormFieldSpecific = (
      ff: BillingsFormField | null
    ): ReactNode => {
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
                    minLength={ff.inputOption?.minLength ?? undefined}
                    maxLength={ff.inputOption?.maxLength ?? undefined}
                    className="customInput size-70"
                    style={{
                      height: 70,
                      fontSize: "2em",
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
                          fontSize: "1.6em",
                        }}
                      >
                        +₱{getFee()} (fee)
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
                    onBlur={() => {
                      if (ff.inputNumberOption?.minLength ?? false) {
                        const min = ff.inputNumberOption?.minLength ?? 0;
                        const value = form
                          .getFieldValue(ff.slug_name)
                          .toString();

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
                    parser={(value: any) =>
                      ff.inputNumberOption?.isMoney
                        ? value.replace(/\$\s?|(,*)/g, "")
                        : value
                    }
                    onChange={(e) => {
                      form.setFieldsValue({
                        [ff.slug_name!]:
                          e + (ff.inputNumberOption?.isMoney ? "_money" : ""),
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
                    styles={{
                      textarea: {
                        minHeight: 70,
                        maxHeight: 200,
                        fontSize: "1.8em",
                        marginBottom: 10,
                      },
                    }}
                    autoSize
                    // autoSize={{
                    //   minRows: ff.textareaOption?.minRow ?? 2,
                    //   maxRows: ff.textareaOption?.maxRow ?? 2,
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
                    marginBottom: 10,
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
                  marginBottom: 10,
                }}
              >
                <FloatLabel
                  value={form.getFieldValue(ff.slug_name)}
                  label={ff.name}
                >
                  <Select
                    size="large"
                    className="customInput size-70"
                    style={{
                      height: 70,
                    }}
                    onChange={(e) =>
                      form.setFieldsValue({ [ff.slug_name!]: e })
                    }
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

    return bill?.formField && bill?.formField?.length > 0 ? (
      <Card
        style={{
          minWidth: 650,
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
          <Typography.Title
            level={1}
            style={{
              marginTop: 20,
              textAlign: "center",
              whiteSpace: "nowrap",
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            {bill?.name} Bills Payment
          </Typography.Title>
        </div>
        {Object.values(error).length > 0 && (
          <Alert
            type="error"
            style={{
              fontSize: "1.4em",
              marginBottom: 10,
              marginTop: 10,
              padding: 24,
              marginRight: 24,
              marginLeft: 24,
            }}
            message={
              <Space direction="vertical" size={[0, 1]}>
                {Object.values(error).map((e: any) => (
                  <span>{e}</span>
                ))}
              </Space>
            }
          />
        )}

        <div
          style={{
            padding: 24,
          }}
        >
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
            {bill?.formField?.map((e) => renderFormFieldSpecific(e))}
            {/* <Button htmlType="submit" type="primary" size="large" block>
            Make Request
          </Button> */}
          </Form>
          {selectedUser == null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                updateOP(
                  "isOnlinePayment",
                  !onlinePaymentInput.isOnlinePayment
                );
                updateCredit("isCredit", false);
              }}
            >
              <Checkbox
                className="customCheckbox"
                checked={onlinePaymentInput.isOnlinePayment}
              />
              <span
                style={{
                  fontSize: "2em",
                  marginLeft: 10,
                }}
              >
                Online Payment
              </span>
            </div>
          )}
          {selectedUser == null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                updateCredit("isCredit", !credit.isCredit);
                updateOP("isOnlinePayment", false);
                setOpenCredit(true);
              }}
            >
              <Checkbox className="customCheckbox" checked={credit.isCredit} />
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

          {onlinePaymentInput.isOnlinePayment && showOnlineForm()}
          {credit.isCredit && showCreditForm()}
          <Divider
            style={{
              background: "#eee",
              margin: 0,
              marginTop: 50,
            }}
          />
          <span
            style={{
              display: "block",
              textAlign: "end",
              fontSize: "2em",
              wordSpacing: 15,
            }}
          >
            TOTAL • ₱{getTotal().toLocaleString()}
          </span>
          <Button
            style={{
              fontSize: 35,
              color: "#fff",
              background: "#294b0f",
              height: 70,
              marginTop: 25,
            }}
            onClick={form.submit}
            loading={loading}
            block
          >
            CONFIRM
          </Button>
        </div>
      </Card>
    ) : (
      <Typography.Text type="secondary" style={{ fontSize: "2em" }}>
        There are no Form Fields added on this Biller
      </Typography.Text>
    );
  };

  //* api helpers
  const getBills = () => {
    (async (_) => {
      let res = await _.getBill();

      if (res.success) {
        setBills(res?.data ?? []);
      }
    })(BillService);
  };

  const handleNotifyDisable = async ({ data }: { data: any[] }) => {
    setBills(
      bills.map((e) => {
        data.forEach((_) => {
          if (_._id == e._id) e.isDisabled = _.isDisabled;
        });
        return e;
      })
    );
    if (data.map((_) => _._id).includes(selectedBill?._id ?? "")) {
      message.warning("This biller has been updated");
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
  }, [selectedBill, bills]);

  useEffect(() => {
    if (open) getBills();
  }, [open]);

  useEffect(() => {
    setWindow(window);
  }, []);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          close();
          setSelectedBill(null);
          setOnlinePaymentInput({
            isOnlinePayment: false,
            portal: "",
            receiverName: "",
            recieverNum: "",
            traceId: "",
          });
          setError({});
          form.resetFields();
          form2.resetFields();
          setSelectedUser(null);
          updateCredit("isCredit", false);
          setAmount(0);
        }}
        width="100%"
        closeIcon={<LeftOutlined />}
        title={
          <Typography.Text style={{ fontSize: 25 }}>
            Bills Payment
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
                marginBottom: 10,
              }}
            >
              <Input
                size="large"
                placeholder="Search/Filter Biller"
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  setSelectedBill(null);
                  setError({});
                }}
                value={searchKey}
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
            <Spin style={{ height: "70vh", width: "100%" }} spinning={false}>
              <Space
                direction="vertical"
                style={{
                  height: "77vh",
                  overflow: "scroll",
                  paddingBottom: 30,
                }}
                className="no-scrollbar"
              >
                {bills
                  .filter((e) => {
                    if (searchKey == "") return true;
                    else
                      return e.name
                        .toLocaleLowerCase()
                        .includes(searchKey.toLocaleLowerCase());
                  })
                  .map((e, i) => (
                    <BillButton
                      bill={e}
                      isSelected={e._id == selectedBill?._id}
                      onSelected={(e) => {
                        setSelectedBill(e);
                        setOnlinePaymentInput({
                          isOnlinePayment: false,
                          portal: "",
                          receiverName: "",
                          recieverNum: "",
                          traceId: "",
                        });
                      }}
                      key={`bills-btn-${i}`}
                      disabled={e.isDisabled ?? false}
                    />
                  ))}
              </Space>
            </Spin>
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
            className={
              bills.filter((e) => selectedBill?._id == e._id).length > 0 &&
              bills.filter((e) => selectedBill?._id == e._id)[0].isDisabled
                ? "disable-content"
                : ""
            }
          >
            {selectedBill && renderSelectedBill(selectedBill)}
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
                    <span>
                      {e.name + " " + e.middlename + " " + e.lastname}
                    </span>
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
    </>
  );
};

export default BillsPayment;
