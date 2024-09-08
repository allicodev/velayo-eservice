import React, { useState } from "react";
import { Button, InputNumber, Modal, Typography } from "antd";

interface MyProps {
  open: boolean;
  onSubmit: (bal: number) => void;
}

const BranchBalanceInit = ({ open, onSubmit }: MyProps) => {
  const [input, setInput] = useState<number | null>();
  return (
    <Modal open={open} closable={false} footer={null} width={300}>
      <Typography.Title
        level={4}
        style={{ display: "block", textAlign: "center" }}
      >
        Please set an initial balance for disbursement/cash box
      </Typography.Title>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
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
            width: 250,
          }}
          onKeyDown={(e) => {
            if (e.code == "Enter") onSubmit(input!);
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
          onClick={() => onSubmit(input!)}
        >
          SUBMIT
        </Button>
      </div>
    </Modal>
  );
};

export default BranchBalanceInit;
