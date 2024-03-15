import React, { useEffect, useState } from "react";
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
  Modal,
  message,
  Input,
} from "antd";
import { DownOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";

import { BillsSettings, Wallet } from "@/types";
import { NewWallet } from "./modals";
import WalletService from "@/provider/wallet.service";
import { FloatLabel } from "@/assets/ts";

const EWalletSettings = ({ open, close }: BillsSettings) => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [updated, setUpdated] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  // for context
  const [contextName, setContextName] = useState("");
  const [openUpdateName, setOpenUpdateName] = useState(false);

  const wallet = new WalletService();

  const renderSettingsForm = (wallet: Wallet) => {
    return (
      <div>
        <Typography.Title>{wallet.name} Fee Settings</Typography.Title>
        <Radio.Group
          style={{
            marginBottom: 15,
          }}
          onChange={(e) => {
            setSelectedWallet({
              _id: wallet?._id,
              name: wallet.name,
              feeType: e.target.value,
              feeValue: wallet.feeValue,
            });
            setUpdated(true);
          }}
          value={wallet.feeType}
        >
          <Radio.Button value="percent">Percent</Radio.Button>
          <Radio.Button value="fixed">Fixed</Radio.Button>
        </Radio.Group>
        <div
          style={{
            display: "flex",
          }}
        >
          <label style={{ fontSize: "1.5em", marginRight: 10 }}>Fee</label>
          <InputNumber
            prefix={wallet.feeType == "percent" ? "%" : "₱"}
            value={wallet.feeValue}
            style={{
              width: 80,
              paddingRight: 10,
            }}
            onChange={(e) => {
              setSelectedWallet({
                _id: wallet?._id,
                name: wallet.name,
                feeType: wallet.feeType,
                feeValue: e,
              });
              setUpdated(true);
            }}
            controls={false}
          />
        </div>
      </div>
    );
  };

  const getWallets = () => {
    (async (_) => {
      let res = await _.getWallet();
      if (res.success) {
        setWallets(res?.data ?? []);

        if (selectedWallet != null) {
          if (res.data)
            setSelectedWallet(res.data[wallets.indexOf(selectedWallet)]);
        }
      }
    })(wallet);
  };

  const handleNewWallet = async (_wallet: Wallet): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (
        wallets
          .map((e) => e.name)
          .filter(
            (e) => e.toLocaleLowerCase() == _wallet.name.toLocaleLowerCase()
          ).length > 0
      ) {
        reject("Wallet already added");
        return;
      }

      (async (_) => {
        let res = await _.newWallet(_wallet);

        if (res.success) {
          message.success(res?.message ?? "Success");
          setTrigger(trigger + 1);
          resolve("Successfully Added");
        } else reject("Error in the server.");
      })(wallet);
    });
  };

  const handleUpdateName = () => {
    (async (_) => {
      if (selectedWallet?._id) {
        let res = await _.updateName(selectedWallet?._id, contextName);
        if (res.success) {
          message.success(res?.message ?? "Success");
          setOpenUpdateName(false);
          setTrigger(trigger + 1);
        }
      }
    })(wallet);
  };

  const handleSave = () => {
    if (selectedWallet?.feeValue == 0) {
      message.error("Fee should not be zero. Please provide.");
      return;
    }
    (async (_) => {
      if (selectedWallet) {
        let res = await _.updateWallet(selectedWallet);

        if (res.success) {
          message.success(res?.message ?? "Success");
          setTrigger(trigger + 1);
        }
      }
    })(wallet);
  };

  useEffect(() => {
    getWallets();
  }, [open, trigger]);

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
            Wallet Settings
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
              {wallets.map((e, i) => (
                <Button
                  key={`wallet-btn-${i}`}
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
              onClick={() => setOpenNewWallet(true)}
            >
              New Wallet
            </Button>
          </Col>
          <Col span={1}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11} style={{ width: "100%" }}>
            {selectedWallet != null && renderSettingsForm(selectedWallet)}
            {selectedWallet != null && (
              <Space
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  ghost
                  style={{
                    width: 150,
                  }}
                  onClick={() => setOpenUpdateName(true)}
                >
                  Update Name
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={!updated}
                  style={{
                    width: 150,
                  }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </Drawer>

      {/* context */}
      <Modal
        open={openUpdateName}
        closable={false}
        title="Update Name"
        footer={[
          <Button
            key="footer-key"
            onClick={handleUpdateName}
            type="primary"
            size="large"
          >
            Update
          </Button>,
        ]}
      >
        <FloatLabel label="Name" value={contextName}>
          <Input
            className="customInput"
            onChange={(e) => setContextName(e.target.value)}
            size="large"
          />
        </FloatLabel>
      </Modal>
      <NewWallet
        open={openNewWallet}
        close={() => setOpenNewWallet(false)}
        onSave={handleNewWallet}
      />
    </>
  );
};

export default EWalletSettings;
