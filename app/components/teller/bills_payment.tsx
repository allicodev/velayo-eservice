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
} from "antd";
import { LeftOutlined } from "@ant-design/icons";

import {
  BillingSettingsType,
  DrawerBasicProps,
  BillButtonProps,
  BillingsFormField,
} from "@/types";
import BillService from "@/provider/bill.service";
import { FloatLabel } from "@/assets/ts";

//* component helper
const BillButton = ({ bill, isSelected, onSelected }: BillButtonProps) => {
  return (
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
      block
    >
      {bill.name}
    </Button>
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

  const handleFinish = (val: any) => {
    val = { ...val, fee: `${getFee()}_money` };

    (async (_) => {
      if (selectedBill) {
        let res = await _.requestBill(selectedBill?.name, JSON.stringify(val));

        if (res.success) {
          setSelectedBill(null);
          message.success(res?.message ?? "Success");
        }
      }
    })(bill);
  };

  const renderSelectedBill = (bill: BillingSettingsType | null): ReactNode => {
    // TODO: create a form validation for restriction given by the options provided by admin

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
                        +₱{getFee()} (fee)
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
                    onChange={(e) =>
                      form.setFieldsValue({ [ff.slug_name!]: e })
                    }
                  />
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
        <Typography.Title level={2}>
          {bill?.name} Bills Payment
        </Typography.Title>
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
        <span style={{ display: "block", textAlign: "end", fontSize: 20 }}>
          TOTAL • ₱{getTotal().toLocaleString()}
        </span>
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
      onClose={close}
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
            {bills.map((e) => (
              <BillButton
                bill={e}
                isSelected={e._id == selectedBill?._id}
                onSelected={(e) => setSelectedBill(e)}
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
