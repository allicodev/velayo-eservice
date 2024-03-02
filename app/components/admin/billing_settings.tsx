import React, { ReactNode, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  FloatButton,
  Row,
  Space,
  Typography,
} from "antd";
import {
  DownOutlined,
  SettingOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import {
  BillsSettings,
  BillingSettingsType,
  BillingsFormField,
  InputOptions,
  NumberOptions,
  TextAreaOptions,
  SelectOptions,
  CheckboxOptions,
} from "@/types";

const BillingSettings = ({ open, close }: BillsSettings) => {
  const [selectedBiller, setSelectedBiller] = useState<BillingSettingsType>();

  const mock: BillingSettingsType[] = [
    {
      name: "VECO",
      formfield: [
        {
          type: "input",
          inputOption: {
            name: "Name",
          },
        },
        {
          type: "select",
          selectOption: {
            name: "Gender",
            items: ["Male", "Female"],
          },
        },
      ],
    },
    {
      name: "PLDT",
    },
    {
      name: "MCWD",
    },
  ];

  const getSideB = (biller: BillingSettingsType) => {
    let billerNode:
      | InputOptions
      | NumberOptions
      | TextAreaOptions
      | SelectOptions
      | CheckboxOptions
      | null = null;

    const billingButton = (formField: BillingsFormField): ReactNode => {
      let index = biller.formfield?.indexOf(formField);

      switch (formField.type) {
        case "checkbox":
          billerNode = {
            name: formField?.checkboxOption?.name ?? "",
            checked: formField.checkboxOption?.checked,
          };
          break;
        case "input": {
          billerNode = {
            name: formField?.inputOption?.name ?? "",
            minLength: formField?.inputOption?.minLength ?? 0,
            maxLength: formField?.inputOption?.maxLength ?? 0,
          };
          break;
        }
        case "number": {
          billerNode = {
            name: formField?.inputNumberOption?.name ?? "",
            min: formField?.inputNumberOption?.min ?? 0,
            max: formField?.inputNumberOption?.max ?? 0,
          };
          break;
        }
        case "select": {
          billerNode = {
            name: formField?.selectOption?.name ?? "",
            items: formField?.selectOption?.items ?? [],
          };
          break;
        }
        case "textarea": {
          billerNode = {
            name: formField?.textareaOption?.name ?? "",
            minRow: formField?.textareaOption?.minRow ?? 0,
            maxRow: formField?.textareaOption?.maxRow ?? 0,
          };
        }
      }

      return (
        <div
          style={{
            display: "flex",
            cursor: "pointer",
          }}
        >
          <span style={{ marginRight: 10, fontSize: 25 }}>{index! + 1}.</span>
          <div
            className="billing-button"
            style={{
              background: "#fff",
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
              border: "0.5px solid #D9D9D9",
              borderRadius: 3,
              display: "flex",
            }}
          >
            <span style={{ fontSize: 18, marginRight: 5 }}>
              {billerNode!.name}
            </span>
            <div
              style={{
                background: "#F0F5FF",
                color: "#2F54EB",
                padding: 3,
                paddingLeft: 5,
                paddingRight: 5,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
              }}
            >
              {formField.type.toLocaleUpperCase()}
            </div>
          </div>
        </div>
      );
    };

    return (
      <>
        <Typography.Title style={{ textAlign: "center" }}>
          {biller.name.toLocaleUpperCase()} bills settings
        </Typography.Title>
        {biller?.formfield?.length != 0 && (
          <Space direction="vertical">
            {biller.formfield?.map((e) => billingButton(e))}
          </Space>
        )}
      </>
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={close}
        width="100%"
        height="100%"
        closeIcon={<DownOutlined />}
        placement="bottom"
        title={
          <Typography.Text style={{ fontSize: 25 }}>
            Bills Settings
          </Typography.Text>
        }
        style={{
          borderTopLeftRadius: 25,
          borderBottomLeftRadius: 25,
          display: "flex",
          justifyContent: "center",
          background: "#eee",
        }}
        rootStyle={{
          marginTop: 20,
          marginLeft: 20,
          marginBottom: 20,
        }}
      >
        <Row
          style={{
            height: "100%",
          }}
        >
          <Col
            span={12}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Space direction="vertical">
              {mock.map((e, i) => (
                <Button
                  key={`billing-btn-${i}`}
                  style={{
                    width: 280,
                    fontSize: 30,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                    ...(selectedBiller?.name == e.name ?? false
                      ? {
                          background: "#294B0F",
                          color: "#fff",
                        }
                      : {
                          background: "#fff",
                          color: "#000",
                        }),
                  }}
                  onClick={() => setSelectedBiller(e)}
                >
                  {e.name.toLocaleUpperCase()}
                </Button>
              ))}
            </Space>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              style={{
                width: 150,
                position: "absolute",
                right: 0,
                bottom: 0,
              }}
            >
              New Biller
            </Button>
          </Col>
          <Col span={1}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11} style={{ width: "100%" }}>
            {selectedBiller != null && getSideB(selectedBiller)}
            {selectedBiller != null && (
              // <FloatButton.Group
              //   trigger="hover"
              //   type="primary"
              //   icon={<SettingOutlined />}
              // >
              <Space
                direction="vertical"
                style={{ position: "absolute", right: 0, bottom: 0 }}
              >
                <Button icon={<PlusOutlined />}>Add New Option</Button>
                <Button icon={<SaveOutlined />} type="primary">
                  SAVE SETTINGS
                </Button>
              </Space>
              // </FloatButton.Group>
            )}
          </Col>
        </Row>
      </Drawer>
    </>
  );
};

export default BillingSettings;
