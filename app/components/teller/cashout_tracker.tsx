import React, { useState } from "react";
import { Button, Input, Modal, Typography, message } from "antd";
import { COProps } from "@/types";
import EtcService from "@/provider/etc.service";
import TransactionHistory from "./transaction_history";

const COTracker = ({ open, close, setOpenedMenu }: COProps) => {
  const [traceId, setTraceId] = useState("");

  const handleSearch = () => {
    (async (_) => {
      let res = await _.getTransactionFromTraceId(traceId);

      if (res?.success ?? false) {
        message.success(res?.message ?? "Found");
        new Promise<void>((resolve, reject) => {
          setOpenedMenu("th");
          resolve();
        }).then(async () => {
          await (TransactionHistory as any).openTransaction(res?.data?._id);
          setTraceId("");
          close();
        });
      }
    })(EtcService);
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={null}
      width={300}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Typography.Title level={3}>Trace ID Tracker</Typography.Title>
      <Input
        style={{
          marginLeft: 10,
          width: "100%",
          fontSize: "1.5em",
          textAlign: "center",
        }}
        placeholder="10 digit"
        minLength={10}
        maxLength={10}
        size="large"
        value={traceId}
        onKeyDown={(e) => {
          const charCode = e.which || e.keyCode;
          if (e.code == "Enter") {
            if (traceId.length < 10) {
              message.warning("Trace ID is too short");
              return;
            }
            handleSearch();
          }
          if (charCode != 8 && charCode != 37 && charCode != 39) {
            if (charCode < 48 || charCode > 57) {
              e.preventDefault();
            }
          }
        }}
        onChange={(e) => setTraceId(e.target.value)}
      />
      <br />
      <Button
        size="large"
        type="primary"
        style={{ marginLeft: 10, fontSize: "1.5em", height: 50 }}
        onClick={handleSearch}
        block
      >
        SEARCH [enter]
      </Button>
    </Modal>
  );
};

export default COTracker;
