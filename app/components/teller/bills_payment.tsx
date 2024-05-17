import React, { useEffect, useState, ReactNode } from "react";
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
} from "antd";
import { LeftOutlined, ReloadOutlined } from "@ant-design/icons";

import {
  BillingSettingsType,
  DrawerBasicProps,
  BillButtonProps,
  BillingsFormField,
  OnlinePayment,
} from "@/types";
import BillService from "@/provider/bill.service";
import { FloatLabel } from "@/assets/ts";
import { useUserStore } from "@/provider/context";
import EtcService from "@/provider/etc.service";

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
                background: "#294B0F",
              }
            : {
                background: "#fff",
              }),
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
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [selectedBill, setSelectedBill] = useState<BillingSettingsType | null>(
    null
  );
  const [amount, setAmount] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState({});
  const [onlinePaymentInput, setOnlinePaymentInput] = useState<OnlinePayment>({
    isOnlinePayment: false,
    portal: "",
    receiverName: "",
    recieverNum: "",
    traceId: "",
  });

  const [loading, setLoading] = useState(false);

  const updateOP = (key: string, value: any) =>
    setOnlinePaymentInput({ ...onlinePaymentInput, [key]: value });

  const billService = new BillService();
  const etc = new EtcService();

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

  const slugToName = (str: string) =>
    str
      .replaceAll("_", " ")
      .split(" ")
      .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
      .join(" ");

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

    const func = () => {
      val = { ...val, fee: `${getFee()}_money` };
      (async (_) => {
        if (selectedBill) {
          setLoading(true);
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
            selectedBill._id
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

            close();
          } else setLoading(false);
        }
      })(billService);
    };

    // if isOnlinepayment is true, check for traceid
    if (onlinePaymentInput.isOnlinePayment)
      return await new Promise(async (resolve, reject) => {
        await etc
          .getTransactionFromTraceId(onlinePaymentInput.traceId)
          .then((e) => (e?.data ? resolve(e.data) : reject()));
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
    console.log("reached");
    func();
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
                          fontSize: "1.8em",
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
              marginBottom: 25,
              fontSize: "1.4em",
              padding: 24,
              margin: 24,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() =>
              updateOP("isOnlinePayment", !onlinePaymentInput.isOnlinePayment)
            }
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
          {onlinePaymentInput.isOnlinePayment && (
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
          )}
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
              background: "#1777FF",
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
    })(billService);
  };

  useEffect(() => {
    if (open) getBills();
  }, [open]);

  useEffect(() => {
    setWindow(window);
  }, []);

  return (
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
          <Space
            direction="vertical"
            style={{ height: "77vh", overflow: "scroll", paddingBottom: 30 }}
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
          {selectedBill && renderSelectedBill(selectedBill)}
        </Col>
      </Row>
    </Drawer>
  );
};

export default BillsPayment;
