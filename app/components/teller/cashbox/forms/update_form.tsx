import React, { useState } from "react";
import { Button, InputNumber, Modal, Typography } from "antd";

import { CashboxFormProps } from "../cashbox.types";

const UpdateCashForm = (props: CashboxFormProps) => {
  const { open, close, updateType, updateBalance } = props;

  const [input, setInput] = useState<number | null>();

  const handleSubmit = () => {
    updateBalance(updateType!, input! * (updateType == "add" ? 1 : -1));
    setInput(null);
    close();
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={null}
      title={
        <Typography.Title
          level={3}
        >{`${updateType?.toLocaleUpperCase()} CASH`}</Typography.Title>
      }
      zIndex={9999}
      width={300}
      styles={{
        body: {
          display: "flex",
          gap: 8,
        },
      }}
    >
      <InputNumber<number>
        controls={false}
        className="customInput"
        size="large"
        prefix="₱"
        min={0}
        value={input}
        formatter={(value: any) =>
          value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
        style={{
          width: 150,
        }}
        onKeyDown={(e) => {
          if (e.code == "Enter") handleSubmit();
        }}
        onChange={(e) => {
          if (e) setInput(e);
          else setInput(null);
        }}
      />
      <Button
        size="large"
        type="primary"
        disabled={input == 0 || input == null || input == undefined}
        onClick={handleSubmit}
      >
        SUBMIT
      </Button>
    </Modal>
  );
};

export default UpdateCashForm;
