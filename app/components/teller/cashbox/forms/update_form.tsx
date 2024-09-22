import React from "react";
import { Button, Input, InputNumber, Modal, Typography } from "antd";

import { CashboxFormProps } from "../cashbox.types";
import useUpdateForm from "./update_form.hooks";

const UpdateCashForm = (props: CashboxFormProps) => {
  const {
    open,
    close,
    updateType,
    canSubmit,
    data,
    onManualCashUpdate,
    updateBalance,
  } = useUpdateForm(props);

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={
        <Button
          size="large"
          type="primary"
          disabled={canSubmit}
          onClick={updateBalance}
          block
        >
          SUBMIT
        </Button>
      }
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
          flexDirection: "column",
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
        value={data.cash}
        placeholder="Amount"
        formatter={(value: any) =>
          value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
        style={{
          width: "100%",
        }}
        onKeyDown={(e) => {
          // if (e.code == "Enter") handleSubmit();
        }}
        onChange={(e) => onManualCashUpdate("cash", e ?? null)}
      />
      <Input.TextArea
        placeholder="Reason"
        autoSize={{ minRows: 3, maxRows: 7 }}
        value={data?.reason ?? ""}
        onChange={(e) => onManualCashUpdate("reason", e.target.value ?? null)}
      />
      <Input.TextArea
        placeholder="Cash from"
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={data?.cashFrom ?? ""}
        onChange={(e) => onManualCashUpdate("cashFrom", e.target.value ?? null)}
      />
    </Modal>
  );
};

export default UpdateCashForm;
