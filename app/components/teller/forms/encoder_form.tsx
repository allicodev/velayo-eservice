import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Modal, message } from "antd";
import { CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";

import { BillsPaymentProps } from "@/types";
import { FloatLabel } from "@/assets/ts";

const EncoderForm = ({ open, close, transaction }: BillsPaymentProps) => {
  const [textData, setTextData] = useState<string[][]>([[], []]);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [isFailed, setIsFailed] = useState(false);
  const [reason, setReason] = useState("");
  const [refNumber, setRefNumber] = useState("");

  useEffect(() => {
    switch (transaction?.name) {
      case "gcash": {
        setTextData([
          ["Transaction Type", "Name", "Mobile Number", "Amount"],
          [
            `${transaction.name.toLocaleUpperCase()} ${transaction.type?.toLocaleUpperCase()}`,
            transaction?.accountName ?? "",
            `+63${transaction.mobileNumber?.slice(1)}`,
            `₱${transaction.amount?.toFixed(2)}`,
          ],
        ]);
      }
    }
  }, [transaction]);
  return (
    <Modal open={open} onCancel={close} footer={null}>
      {textData[0].map((_, i) => (
        <div style={{ display: "flex" }} key={i}>
          <div style={{ width: 200, fontSize: 20 }}>{_}:</div>
          <div style={{ width: 150, fontSize: 20 }}>{textData[1][i]}</div>
          {i != 0 ? (
            <Button
              icon={
                copiedIndex == i ? (
                  <CheckCircleOutlined
                    style={{
                      color: "#fff",
                    }}
                  />
                ) : (
                  <CopyOutlined
                    style={{
                      color: "#fff",
                    }}
                  />
                )
              }
              size="small"
              style={{
                backgroundColor: "#1777FF",
                color: "#fff",
                borderRadius: 8,
              }}
              onClick={() => {
                setCopiedIndex(i);
                setTimeout(() => setCopiedIndex(-1), 2500);
                let textToBeCopied: any = "";

                switch (_) {
                  case "Mobile Number": {
                    textToBeCopied = "0" + textData[1][i].slice(3);
                    break;
                  }
                  case "Amount": {
                    textToBeCopied = parseInt(textData[1][i].slice(1));
                    break;
                  }
                  default:
                    textToBeCopied = textData[1][i];
                }
                navigator.clipboard
                  .writeText(textToBeCopied)
                  .then((e) => message.success("Copied Successfully"));
              }}
            >
              {copiedIndex == i ? "Copied" : "Copy"}
            </Button>
          ) : null}
        </div>
      ))}
      <div
        style={{ marginTop: 10, cursor: "pointer", display: "inline-block" }}
        onClick={() => setIsFailed(!isFailed)}
      >
        <Checkbox checked={isFailed} /> Set Status Failed
      </div>
      {isFailed ? (
        <FloatLabel label="Reason" value={reason}>
          <Input.TextArea
            autoSize={{
              minRows: 4,
            }}
            style={{
              marginTop: 20,
            }}
            onChange={(e) => setReason(e.target.value)}
            className="customInput"
          />
        </FloatLabel>
      ) : (
        <div style={{ marginTop: 20 }}>
          <FloatLabel label="Reference Number" value={refNumber}>
            <Input
              size="large"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              suffix={
                <Button
                  onClick={() =>
                    navigator.clipboard.readText().then((e) => setRefNumber(e))
                  }
                >
                  paste
                </Button>
              }
            />
          </FloatLabel>
        </div>
      )}
    </Modal>
  );
};

export default EncoderForm;
