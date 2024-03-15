import React, { useState } from "react";
import { NewWalletProps, WalletFeeType } from "@/types";
import {
  Button,
  Input,
  Modal,
  Radio,
  Typography,
  InputNumber,
  message,
} from "antd";
import { FloatLabel } from "@/assets/ts";

const NewWallet = ({ open, close, onSave }: NewWalletProps) => {
  const [input, setInput] = useState("");
  const [type, setType] = useState<WalletFeeType>("percent");
  const [fee, setFee] = useState<number | null>();

  const handleFinish = async () => {
    // validate

    if (input == "") {
      message.error("Wallet Name is empty. Please provide.");
      return;
    }

    if (fee == null) {
      message.error("Fee is empty. Please provide.");
      return;
    }

    if (fee) {
      await onSave({
        name: input,
        feeType: type,
        feeValue: fee,
      })
        .then((e) => {
          message.success(e);
          close();
          return;
        })
        .catch((e) => {
          message.error(e);
        });
    }
  };

  return (
    <Modal
      title={<Typography.Title level={2}>New Wallet</Typography.Title>}
      open={open}
      onCancel={() => {
        setInput("");
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
      <FloatLabel label="Wallet Name" value={input}>
        <Input
          className="customInput"
          style={{
            display: "block",
            height: 40,
          }}
          onChange={(e) => setInput(e.target.value)}
        />
      </FloatLabel>
      <label>Fee Options: </label>
      <br />
      <Radio.Group
        defaultValue={type}
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <Radio.Button value="percent">Percent (%)</Radio.Button>
        <Radio.Button value="fixed">Fixed (₱)</Radio.Button>
      </Radio.Group>
      <FloatLabel label="Fee" value={fee?.toString()} style={{ marginTop: 10 }}>
        <InputNumber
          prefix={type == "percent" ? "%" : "₱"}
          value={fee}
          className="customInput"
          size="large"
          style={{
            width: 120,
            paddingRight: 10,
          }}
          onChange={(e) => setFee(e)}
          controls={false}
        />
      </FloatLabel>
    </Modal>
  );
};

export { NewWallet };
