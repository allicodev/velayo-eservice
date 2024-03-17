import React, { useState } from "react";
import { NewWalletProps, Fee } from "@/types";
import {
  Button,
  Input,
  Modal,
  Radio,
  Typography,
  InputNumber,
  message,
  Divider,
} from "antd";
import { FloatLabel } from "@/assets/ts";

const NewWallet = ({ open, close, onSave }: NewWalletProps) => {
  const [name, setName] = useState("");
  const [cashinOpt, setCashinOpt] = useState<Fee>({
    fee: null,
    type: "percent",
  });
  const [cashoutOpt, setCashoutOpt] = useState<Fee>({
    fee: null,
    type: "percent",
  });

  const handleFinish = async () => {
    // validate
    if (name == "") {
      message.error("Wallet Name is empty. Please provide.");
      return;
    }

    if (cashinOpt.fee == null) {
      message.error("Cash-In Fee is empty. Please provide.");
      return;
    }

    if (cashoutOpt.fee == null) {
      message.error("Cash-Out Fee is empty. Please provide.");
      return;
    }

    await onSave({
      name,
      cashinType: cashinOpt.type,
      cashinFeeValue: cashinOpt.fee!,
      cashoutType: cashoutOpt.type,
      cashoutFeeValue: cashoutOpt.fee!,
      cashInFormField: [],
      cashOutFormField: [],
    })
      .then((e) => {
        message.success(e);
        close();
        return;
      })
      .catch((e) => {
        message.error(e);
      });
  };

  return (
    <Modal
      title={<Typography.Title level={2}>New Wallet</Typography.Title>}
      open={open}
      onCancel={() => {
        setName("");
        setCashinOpt({
          fee: null,
          type: "percent",
        });
        setCashoutOpt({
          fee: null,
          type: "percent",
        });
        close();
      }}
      footer={[
        <Button
          key="new-biller-btn"
          type="primary"
          size="large"
          onClick={handleFinish}
        >
          New Wallet
        </Button>,
      ]}
      closable={false}
      destroyOnClose
    >
      <FloatLabel label="Wallet Name" value={name}>
        <Input
          className="customInput"
          style={{
            display: "block",
            height: 40,
          }}
          onChange={(e) => setName(e.target.value)}
        />
      </FloatLabel>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <div>
          <strong>Cash-in Fee Options: </strong>
          <br />
          <FloatLabel
            label="Fee"
            bool={cashinOpt.fee != null}
            style={{ marginTop: 10 }}
          >
            <InputNumber
              prefix={cashinOpt.type == "percent" ? "%" : "₱"}
              value={cashinOpt.fee}
              className="customInput"
              size="large"
              style={{
                width: 120,
                paddingRight: 10,
              }}
              onChange={(e) => setCashinOpt({ ...cashinOpt, fee: e })}
              controls={false}
            />
          </FloatLabel>
          <Radio.Group
            defaultValue={cashinOpt.type}
            value={cashinOpt.type}
            onChange={(e) =>
              setCashinOpt({ ...cashinOpt, type: e.target.value })
            }
          >
            <Radio value="percent">Percent (%)</Radio>
            <Radio value="fixed">Fixed (₱)</Radio>
          </Radio.Group>
        </div>
        <Divider type="vertical" style={{ height: 120 }} />
        <div
          style={{
            marginLeft: 15,
          }}
        >
          <strong>Cash-out Fee Options: </strong>
          <br />
          <FloatLabel
            label="Fee"
            bool={cashoutOpt.fee != null}
            style={{ marginTop: 10 }}
          >
            <InputNumber
              prefix={cashoutOpt.type == "percent" ? "%" : "₱"}
              value={cashoutOpt.fee}
              className="customInput"
              size="large"
              style={{
                width: 120,
                paddingRight: 10,
              }}
              onChange={(e) => setCashoutOpt({ ...cashoutOpt, fee: e })}
              controls={false}
            />
          </FloatLabel>
          <Radio.Group
            defaultValue={cashoutOpt.type}
            value={cashoutOpt.type}
            onChange={(e) =>
              setCashoutOpt({ ...cashoutOpt, type: e.target.value })
            }
          >
            <Radio value="percent">Percent (%)</Radio>
            <Radio value="fixed">Fixed (₱)</Radio>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};

export { NewWallet };
