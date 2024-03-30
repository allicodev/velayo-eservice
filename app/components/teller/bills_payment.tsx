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
} from "@/types";
import BillService from "@/provider/bill.service";
import { FloatLabel } from "@/assets/ts";

//* component helper
const BillButton = ({
  bill,
  isSelected,
  onSelected,
  disabled,
}: BillButtonProps) => {
  return (
    <Tooltip title={disabled ? "This Biller has been disabled by encoder" : ""}>
      <Button
        size="large"
        style={{
          width: 300,
          fontSize: 35,
          paddingTop: 10,
          paddingBottom: 10,
          height: 70,
          ...(isSelected
            ? {
                background: "#294B0F",
                color: "#fff",
              }
            : {
                background: "#fff",
                color: "#000",
              }),
        }}
        onClick={() => onSelected(bill)}
        disabled={disabled}
        block
      >
        {bill.name}
      </Button>
    </Tooltip>
  );
};

const BillsPayment = ({ open, close }: DrawerBasicProps) => {
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const [bills, setBills] = useState<BillingSettingsType[]>([]);
  const [form] = Form.useForm();
  const [selectedBill, setSelectedBill] = useState<BillingSettingsType | null>(
    null
  );
  const [amount, setAmount] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState({});

  const bill = new BillService();

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

  const handleFinish = (val: any) => {
    val = { ...val, fee: `${getFee()}_money` };

    (async (_) => {
      if (selectedBill) {
        let res = await _.requestBill(
          selectedBill?.name,
          JSON.stringify({
            ...val,
            billerId: selectedBill._id,
            transactionType: "biller",
          }),
          amount,
          getFee()
        );

        if (res.success) {
          setSelectedBill(null);
          message.success(res?.message ?? "Success");
          close();
        }
      }
    })(bill);
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
                rules={[{ required: true }]}
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
                rules={[{ required: true }]}
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
                rules={[{ required: true }]}
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

    return (
      <Card
        style={{
          width: 500,
        }}
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <Typography.Title level={1}>
          {bill?.name} Bills Payment
        </Typography.Title>
        {Object.values(error).length > 0 && (
          <Alert
            type="error"
            style={{ marginBottom: 25, fontSize: "1.4em" }}
            message={
              <Space direction="vertical" size={[0, 1]}>
                {Object.values(error).map((e: any) => (
                  <span>{e}</span>
                ))}
              </Space>
            }
          />
        )}
        {bill?.formField && bill?.formField?.length > 0 && (
          <React.Fragment>
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
                display: "block",
                fontSize: 35,
                color: "#fff",
                background: "#1777FF",
                height: 70,
                marginTop: 25,
              }}
              onClick={form.submit}
            >
              CONFIRM
            </Button>
          </React.Fragment>
        )}
      </Card>
    );
  };

  //* api helpers
  const getBills = () => {
    (async (_) => {
      let res = await _.getBill();

      if (res.success) {
        setBills(res?.data ?? []);
      }
    })(bill);
  };

  useEffect(() => {
    getBills();
  }, []);

  useEffect(() => {
    setWindow(window);
  }, []);

  return (
    <Drawer
      open={open}
      onClose={() => {
        close();
        setSelectedBill(null);
        setError({});
        form.resetFields();
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
    >
      <Row>
        <Col span={6}>
          <Space direction="vertical">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: 300,
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
