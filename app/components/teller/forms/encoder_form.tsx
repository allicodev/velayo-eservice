import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Modal, Tag, Typography, message } from "antd";
import {
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { BillsPaymentProps } from "@/types";
import { FloatLabel } from "@/assets/ts";
import BillService from "@/provider/bill.service";

// TODO: failed transaction should not be updateable

const EncoderForm = ({
  open,
  close,
  transaction,
  refresh,
}: BillsPaymentProps) => {
  const [textData, setTextData] = useState<string[][]>([[], []]);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [isFailed, setIsFailed] = useState(false);
  const [reason, setReason] = useState("");
  const [refNumber, setRefNumber] = useState("");

  const bill = new BillService();

  const handleUpdate = () => {
    if (!isFailed) {
      if (refNumber == "") {
        message.warning("Reference number is empty. Cannot update.");
        return;
      }
      (async (_) => {
        if (transaction) {
          transaction.history.push({
            description: "Transaction completed",
            status: "completed",
          });
          let res = await _.updateTransaction({
            ...transaction,
            type: "bills",
            reference: refNumber,
          });

          if (res.success) {
            message.success(res?.message ?? "Success");
            if (refresh) refresh();
            close();
          }
        }
      })(bill);
    } else {
      (async (_) => {
        if (transaction) {
          transaction.history.push({
            description: reason,
            status: "failed",
          });
          let res = await _.updateTransaction({
            ...transaction,
            type: "bills",
            reference: refNumber,
          });

          if (res.success) {
            message.success(res?.message ?? "Success");
            if (refresh) refresh();
            close();
          }
        }
      })(bill);
    }
  };

  useEffect(() => {
    if (open) {
      if (transaction?.type == "bills") {
        if (transaction.transactionDetails) {
          setTextData([
            [
              ...Object.keys(JSON.parse(transaction.transactionDetails)).map(
                (e) =>
                  e
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
                    .join(" ")
              ),
            ],
            [
              ...Object.values(JSON.parse(transaction.transactionDetails)).map(
                (e: any) => {
                  if (typeof e == "string" && e.startsWith("09"))
                    return `+${63}${e.slice(1)}`;
                  return e;
                }
              ),
            ],
          ]);
        }
      }
    }
  }, [transaction, open]);

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      title={<Typography.Title level={2}>Transaction Details</Typography.Title>}
    >
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
      {/* conditional rendering */}
      {transaction && transaction.history.at(-1)?.status == "pending" ? (
        <>
          <div
            style={{
              marginTop: 10,
              cursor: "pointer",
              display: "inline-block",
            }}
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
                        navigator.clipboard
                          .readText()
                          .then((e) => setRefNumber(e))
                      }
                    >
                      paste
                    </Button>
                  }
                />
              </FloatLabel>
            </div>
          )}
          <Button type="primary" size="large" block onClick={handleUpdate}>
            Update Transaction
          </Button>
          <span
            style={{
              color: "#8C8C8C",
              fontSize: 14,
              display: "block",
              textAlign: "center",
            }}
          >
            <ExclamationCircleOutlined /> By updating this, the status of the
            transaction become{" "}
            <span
              style={{
                color: isFailed ? "#FF0000BF" : "#28A745BF",
              }}
            >
              {isFailed ? "failed" : "completed"}
            </span>
          </span>
        </>
      ) : (
        <>
          <div style={{ display: "flex" }}>
            <div style={{ width: 200, fontSize: 20 }}>Current Status:</div>
            <div style={{ width: 150, fontSize: 20 }}>
              <Tag
                color={
                  transaction?.history.at(-1)?.status == "failed"
                    ? "#f00"
                    : "#29A645"
                }
              >
                {transaction?.history.at(-1)?.status == "failed"
                  ? "FAILED"
                  : "SUCCESS"}
              </Tag>
            </div>
          </div>
          {transaction?.history.at(-1)?.status == "failed" && (
            <div style={{ display: "flex" }} key="failed-transact-container">
              <div style={{ width: 200, fontSize: 20 }}>Reason/s:</div>
              <div
                style={{
                  width: 300,
                  minHeight: 120,
                  fontSize: 16,
                  borderRadius: 10,
                  marginTop: 5,
                  padding: 5,
                  paddingLeft: 8,
                  background: "#eee",
                }}
              >
                {transaction?.history.at(-1)?.description}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default EncoderForm;
