import React, { useState } from "react";
import { Button, Input, InputNumber, Modal, Typography } from "antd";
import usebalanceInit, { MyProps } from "./balance_init.hook";

const BranchBalanceInit = (props: MyProps) => {
  const {
    open,
    handleOnSubmitBalance,
    onManualCashUpdate,
    manualCashOpt,
    checkValidation,
  } = usebalanceInit(props);

  return (
    <Modal
      open={open}
      closable={false}
      width={300}
      title={
        <Typography.Title
          level={4}
          style={{ display: "block", textAlign: "center" }}
        >
          Please set an initial balance for disbursement/cash box
        </Typography.Title>
      }
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: 8,
        },
      }}
      footer={
        <Button
          size="large"
          type="primary"
          disabled={!checkValidation()}
          onClick={handleOnSubmitBalance}
        >
          SUBMIT
        </Button>
      }
    >
      <InputNumber<number>
        controls={false}
        className="customInput"
        size="large"
        prefix="₱"
        min={0}
        value={manualCashOpt.cash}
        formatter={(value: any) =>
          value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
        style={{
          width: 250,
        }}
        onKeyDown={(e) => {
          if (e.code == "Enter") handleOnSubmitBalance();
        }}
        onChange={(e) => onManualCashUpdate("cash", e ?? null)}
      />
      <Input.TextArea
        placeholder="Reason"
        size="large"
        autoSize={{ minRows: 3, maxRows: 7 }}
        value={manualCashOpt?.reason ?? ""}
        onChange={(e) => onManualCashUpdate("reason", e.target.value ?? null)}
      />
      <Input.TextArea
        placeholder="Cash from"
        size="large"
        autoSize={{ minRows: 2, maxRows: 3 }}
        value={manualCashOpt?.cashFrom ?? ""}
        onChange={(e) => onManualCashUpdate("cashFrom", e.target.value ?? null)}
      />
    </Modal>
  );
};

export default BranchBalanceInit;
