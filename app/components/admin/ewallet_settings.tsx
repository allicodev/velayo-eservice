import React, { useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  InputNumber,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";
import { DownOutlined, SaveOutlined } from "@ant-design/icons";
import { BillsSettings, EWalletDataType } from "@/types";

const EWalletSettings = ({ open, close }: BillsSettings) => {
  const [selectedWallet, setSelectedWallet] = useState<EWalletDataType>();
  const [selectedRate, setSelectedRate] = useState<"₱" | "%">("%");
  const [rate, setRate] = useState<number | null>();

  const [mock, setMock] = useState<EWalletDataType[]>([
    {
      name: "GCASH",
      type: "percent",
      value: 2,
    },
    {
      name: "MAYA",
      type: "percent",
      value: 2,
    },
    {
      name: "PALAWAN PAY",
      type: "fixed",
      value: 15,
    },
    {
      name: "Union Bank",
      type: "fixed",
      value: 15,
    },
  ]);

  const renderSettingsForm = (wallet: EWalletDataType) => {
    return (
      <div>
        <Typography.Title>{wallet.name} Fee Settings</Typography.Title>
        <Radio.Group
          style={{
            marginBottom: 15,
          }}
          onChange={(e) => {
            setSelectedRate(e.target.value);
            setRate(null);
          }}
          value={selectedRate}
        >
          <Radio.Button value="%">Percent</Radio.Button>
          <Radio.Button value="₱">Fixed</Radio.Button>
        </Radio.Group>
        <div
          style={{
            display: "flex",
          }}
        >
          <label style={{ fontSize: "1.5em", marginRight: 10 }}>Fee</label>
          <InputNumber
            prefix={selectedRate}
            value={rate}
            style={{
              width: 80,
            }}
            onChange={(e) => setRate(e)}
            controls={false}
          />
        </div>
      </div>
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
                    ...(selectedWallet?.name == e.name ?? false
                      ? {
                          background: "#294B0F",
                          color: "#fff",
                        }
                      : {
                          background: "#fff",
                          color: "#000",
                        }),
                  }}
                  onClick={() => setSelectedWallet(e)}
                >
                  {e.name.toLocaleUpperCase()}
                </Button>
              ))}
            </Space>
          </Col>
          <Col span={1}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11} style={{ width: "100%" }}>
            {selectedWallet != null && renderSettingsForm(selectedWallet)}
            {selectedWallet != null && (
              <Button
                size="large"
                type="primary"
                icon={<SaveOutlined />}
                style={{
                  width: 150,
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                }}
                //   onClick={(e) => setOpenNewBiller(true)}
              >
                Save
              </Button>
            )}
          </Col>
        </Row>
      </Drawer>
    </>
  );
};

export default EWalletSettings;
