import React, { useState } from "react";
import { Button, InputNumber, Modal, Typography, message } from "antd";
import { BalanceUpdaterProps } from "@/types";
import LogService from "@/provider/log.service";
import { useUserStore } from "@/provider/context";

const BalanceUpdater = ({
  open,
  close,
  _id,
  name,
  type,
  refresh,
}: BalanceUpdaterProps) => {
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();

  const handleUpdate = async () => {
    let res = await LogService.newLog({
      userId: currentUser?._id ?? "",
      type: "portal",
      portalId: _id,
      amount: type == "add" ? input : -input,
    });

    if (res?.success ?? false) {
      message.success(res?.message ?? "Success");
      setInput("");
      refresh!();
      close!();
    }
  };
  return (
    <Modal
      open={open}
      onCancel={() => {
        setInput("");
        close!();
      }}
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {type == "add" ? "Add" : "Deduct"} balance for {name}
        </Typography.Title>
      }
      closable={false}
      width={250}
      footer={
        <Button
          size="large"
          type="primary"
          onClick={handleUpdate}
          disabled={input == "" || input == undefined}
          block
        >
          UPDATE
        </Button>
      }
    >
      <InputNumber
        size="large"
        min={0}
        style={{
          width: "100%",
        }}
        formatter={(value: any) =>
          value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
        controls={false}
        value={input}
        onChange={setInput}
      />
    </Modal>
  );
};

export default BalanceUpdater;
