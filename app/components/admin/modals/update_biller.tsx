import React, { useEffect, useState } from "react";
import { UpdateBillerProps } from "@/types";
import { Button, Input, Modal, Typography, message } from "antd";
import { FloatLabel } from "@/assets/ts";

const UpdateBiller = ({ open, close, onSave, name }: UpdateBillerProps) => {
  const [input, setInput] = useState("");

  const handleFinish = () => {
    if (input == "") {
      message.error("Input is empty. Please provide.");
      return;
    }
    const flag = onSave(input);

    if (flag) {
      message.warning("Biller's Name already taken");
      return;
    }
    close();
  };

  useEffect(() => {
    setInput(name);
  }, [name, open]);

  return (
    <Modal
      title={<Typography.Title level={2}>Update Biller</Typography.Title>}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </FloatLabel>
    </Modal>
  );
};

export { UpdateBiller };
