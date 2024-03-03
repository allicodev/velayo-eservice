import React, { ReactNode, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { QuestionCircleOutlined, CloseOutlined } from "@ant-design/icons";

import { NewOptionProps, BillingOptionsType } from "@/types";

const NewOption = ({ open, close }: NewOptionProps) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<BillingOptionsType | null>(
    null
  );

  const optionalHeader = ({ children }: { children: ReactNode }) => (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }}>
      <Typography.Text
        type="secondary"
        style={{
          fontSize: "1.2em",
        }}
      >
        Optional Settings{" "}
        <Tooltip title="You can leave the option blank if not necessary">
          <QuestionCircleOutlined />
        </Tooltip>
      </Typography.Text>
      {children}
    </div>
  );

  const getAdditionalOptions = (type: BillingOptionsType | null): ReactNode => {
    switch (type) {
      case "input":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label
                  style={{ fontSize: "1.25em", marginRight: 10, width: 700 }}
                >
                  Minimum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    width: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
            </Space>
          ),
        });

      case "number":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Minimum
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
            </Space>
          ),
        });

      case "textarea":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 160,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Minimum Row
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 160,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum Row
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                />
              </div>
            </Space>
          ),
        });

      case "select":
        return optionalHeader({
          children: (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div>
                <Input
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="Type your menu here..."
                />
                <Button type="primary">ADD</Button>
              </div>
              <Space
                direction="vertical"
                style={{
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    width: 150,
                    border: "0.5px solid #b7b7b7",
                    height: 35,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4em",
                    position: "relative",
                    color: "#000000e0",
                  }}
                >
                  Menu 1
                  <CloseOutlined
                    style={{ position: "absolute", right: 8, fontSize: 12 }}
                  />
                </div>
                <div
                  style={{
                    width: 150,
                    border: "0.5px solid #b7b7b7",
                    height: 35,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4em",
                    position: "relative",
                    color: "#000000e0",
                  }}
                >
                  Menu 2
                  <CloseOutlined
                    style={{ position: "absolute", right: 8, fontSize: 12 }}
                  />
                </div>
                <div
                  style={{
                    width: 150,
                    border: "0.5px solid #b7b7b7",
                    height: 35,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4em",
                    position: "relative",
                    color: "#000000e0",
                  }}
                >
                  Menu 3
                  <CloseOutlined
                    style={{ position: "absolute", right: 8, fontSize: 12 }}
                  />
                </div>
              </Space>
            </div>
          ),
        });
    }
  };

  return (
    <Modal open={open} onCancel={close} okText="Add Option">
      <Form
        form={form}
        colon={false}
        labelAlign="left"
        labelCol={{
          flex: "90px",
        }}
        wrapperCol={{
          flex: 1,
        }}
        labelWrap
      >
        <Form.Item
          label={
            <Typography.Text style={{ fontSize: "1.6em" }}>
              Title
            </Typography.Text>
          }
          name="title"
          style={{
            marginTop: 25,
          }}
        >
          <Input style={{ display: "block" }} />
        </Form.Item>
        <Form.Item
          label={
            <Typography.Text style={{ fontSize: "1.6em" }}>
              Type
            </Typography.Text>
          }
          name="type"
          style={{
            marginTop: 25,
          }}
        >
          <Select
            placeholder="Choose a Type"
            style={{
              width: 150,
            }}
            onChange={(e) => setSelectedType(e)}
            options={[
              {
                label: "Input",
                value: "input",
              },
              {
                label: "Input Number",
                value: "number",
              },
              {
                label: "Text Area",
                value: "textarea",
              },
              {
                label: "Checkbox",
                value: "checkbox",
              },
              {
                label: "Select",
                value: "select",
              },
            ]}
          />
        </Form.Item>

        <div className="additional-options-container">
          {getAdditionalOptions(selectedType)}
        </div>
      </Form>
    </Modal>
  );
};

export { NewOption };
