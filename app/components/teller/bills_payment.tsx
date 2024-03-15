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
  Tooltip,
  Checkbox,
  Select,
  Affix,
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

  const bill = new BillService();

  const handleFinish = (val: any) => {
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
                label={
                  <Tooltip title={ff.name}>
                    <Typography.Paragraph
                      style={{
                        fontSize: 18,
                        alignItems: "center",
                        maxWidth: 100,
                      }}
                      ellipsis={true}
                    >
                      {ff.name}
                    </Typography.Paragraph>
                  </Tooltip>
                }
                name={ff.slug_name}
                style={{ alignSelf: "start" }}
                rules={[{ required: true }]}
              >
                <Input
                  size="large"
                  minLength={ff.inputOption?.minLength ?? undefined}
                  maxLength={ff.inputOption?.minLength ?? undefined}
                />
              </Form.Item>
            );
          }

          case "number": {
            return (
              <Form.Item
                label={
                  <Tooltip title={ff.name}>
                    <Typography.Paragraph
                      style={{
                        fontSize: 18,
                        alignItems: "center",
                        maxWidth: 100,
                      }}
                      ellipsis={true}
                    >
                      {ff.name}
                    </Typography.Paragraph>
                  </Tooltip>
                }
                name={ff.slug_name}
                style={{ alignSelf: "start" }}
                rules={[{ required: true }]}
              >
                <InputNumber
                  size="large"
                  controls={false}
                  style={{ width: 100 }}
                  min={ff.inputNumberOption?.min ?? undefined}
                  max={ff.inputNumberOption?.max ?? undefined}
                />
              </Form.Item>
            );
          }

          case "textarea": {
            return (
              <Form.Item
                label={
                  <Tooltip title={ff.name}>
                    <Typography.Paragraph
                      style={{
                        fontSize: ff.name.length > 15 ? 15 : 25,
                        alignItems: "center",
                        maxWidth: 100,
                      }}
                      ellipsis={true}
                    >
                      {ff.name}
                    </Typography.Paragraph>
                  </Tooltip>
                }
                name={ff.slug_name}
                style={{ alignSelf: "start" }}
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  size="large"
                  placeholder={`${ff.name}...`}
                  autoSize={{
                    minRows: ff.textareaOption?.minRow ?? undefined,
                    maxRows: ff.textareaOption?.maxRow ?? undefined,
                  }}
                />
              </Form.Item>
            );
          }

          case "checkbox": {
            return (
              <Form.Item
                label={
                  <Tooltip title={ff.name}>
                    <Typography.Paragraph
                      style={{
                        fontSize: ff.name.length > 15 ? 15 : 25,
                        alignItems: "center",
                        maxWidth: 100,
                      }}
                      ellipsis={true}
                    >
                      {ff.name}
                    </Typography.Paragraph>
                  </Tooltip>
                }
                name={ff.slug_name}
                style={{ alignSelf: "start" }}
              >
                <Checkbox />
              </Form.Item>
            );
          }

          case "select": {
            return (
              <Form.Item
                label={
                  <Tooltip title={ff.name}>
                    <Typography.Paragraph
                      style={{
                        fontSize: ff.name.length > 15 ? 15 : 25,
                        alignItems: "center",
                        maxWidth: 100,
                      }}
                      ellipsis={true}
                    >
                      {ff.name}
                    </Typography.Paragraph>
                  </Tooltip>
                }
                name={ff.slug_name}
                style={{ alignSelf: "start" }}
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Choose a select option"
                  options={ff.selectOption?.items?.map((e) => {
                    return {
                      label: e.name,
                      value: e.value,
                    };
                  })}
                />
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
          overflow: "scroll",
          maxHeight: 600,
        }}
      >
        <Typography.Title level={2}>
          {bill?.name} Bills Payment
        </Typography.Title>
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          style={{ maxWidth: 600 }}
          labelAlign="left"
          colon={false}
          requiredMark={"optional"}
          onFinish={handleFinish}
        >
          {bill?.formField?.map((e) => renderFormFieldSpecific(e))}
          <Button htmlType="submit" type="primary" size="large" block>
            Make Request
          </Button>
        </Form>
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
