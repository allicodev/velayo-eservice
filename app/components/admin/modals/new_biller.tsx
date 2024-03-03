import React, { useState } from "react";
import { NewBillerProps } from "@/types";
import { Button, Input, Modal, Typography, message } from "antd";
import { FloatLabel } from "@/assets/ts";

const NewBiller = ({ open, close, onSave }: NewBillerProps) => {
  const [input, setInput] = useState("");

  const handleFinish = () => {
    if (input == "") {
      message.error("Input is empty. Please provide.");
      return;
    }
    const flag = onSave(input);

    if (flag) {
      message.warning("Biller already added");
      return;
    }
    message.success("Successfully Added");
    close();
  };

  return (
    <Modal
      title={<Typography.Title level={2}>New Biller</Typography.Title>}
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
          ADD
        </Button>,
      ]}
      closable={false}
      destroyOnClose
    >
      <FloatLabel label="Biller's Name" value={input}>
        <Input
          className="customInput"
          style={{
            display: "block",
            height: 40,
          }}
          onChange={(e) => setInput(e.target.value)}
        />
      </FloatLabel>
    </Modal>
  );
};

export { NewBiller };
