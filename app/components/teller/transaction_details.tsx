import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Timeline,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import PrinterService from "@/provider/printer.service";
import {
  Branch,
  TransactionDetailsProps,
  TransactionHistoryDataType_type,
  User,
} from "@/types";
import { transactionToPrinter } from "@/assets/ts";
import { useUserStore } from "@/provider/context";

const TransactionDetails = ({
  open,
  close,
  transaction,
}: TransactionDetailsProps) => {
  const [textData, setTextData] = useState<[string[], any[]]>([[], []]);
  const printer = new PrinterService();

  const latestHistory = () => transaction?.history?.at(-1);
  const { currentBranch } = useUserStore();

  const getStatusColor = (status: TransactionHistoryDataType_type): string => {
    if (status == "completed") return "#29A645";
    else if (status == "failed") return "#FF0000";
    else return "#EFB40D";
  };
  const getStatusBadge = (status: TransactionHistoryDataType_type) => (
    <div
      style={{
        padding: 2,
        paddingLeft: 15,
        paddingRight: 15,
        color: "#fff",
        display: "inline-block",
        borderRadius: 10,
        fontSize: "0.85em",
        backgroundColor: getStatusColor(status),
      }}
    >
      {status[0].toLocaleUpperCase()}
      {status.slice(1)}
    </div>
  );

  const getStatusHistory = () => (
    <Timeline
      mode="left"
      items={transaction?.history?.map((e) => {
        return {
          label: dayjs(e.dateCreated).format("MMM DD, YYYY - hh:mma"),
          children: e.description,
          dot: (
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: getStatusColor(e.status),
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#fff",
                }}
              />
            </div>
          ),
          //   color: getStatusColor(e.status),
        };
      })}
    />
  );

  const handlePrint = () => {
    (async (_) => {
      if (transaction) {
        let { data } = await _.printReceipt({
          printData: transactionToPrinter(transaction),
          branchId: currentBranch,
        });

        if (data?.success ?? false) {
          message.success(data?.message ?? "Success");
        }
      }
    })(printer);
  };

  useEffect(() => {
    if (open && transaction) {
      if (transaction.transactionDetails) {
        let _ = JSON.parse(transaction.transactionDetails);
        setTextData([
          [
            "Type",
            "Biller",
            "Teller",
            ...Object.keys(_)
              .filter(
                (e: any) =>
                  !["billerId", "transactionType", "tellerId"].includes(e)
              )
              .map((e) =>
                e
                  .replaceAll("_", " ")
                  .split(" ")
                  .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
                  .join(" ")
              ),
            "Request Date",
            "Current Status",
          ],
          [
            transaction.type.toLocaleUpperCase(),
            transaction.sub_type.toLocaleUpperCase(),
            `${(transaction.tellerId as User)?.name ?? "No Teller"} (${
              (transaction.branchId as Branch)?.name ?? "No Branch"
            })` ?? "No Teller",
            ...Object.keys(_)
              .filter(
                (e: any) =>
                  !["billerId", "transactionType", "tellerId"].includes(e)
              )
              .map((e: any) => {
                if (typeof _[e] == "string" && _[e].includes("_money"))
                  return `₱${parseInt(_[e].split("_")[0]).toLocaleString()}`;
                // if (typeof e == "string" && e.startsWith("09"))
                //   return `+${63}${e.slice(1)}`;
                return _[e];
              }),
            dayjs(transaction?.createdAt).format("MMMM DD, YYYY - hh:mma"),
            getStatusBadge(latestHistory()!.status),
          ],
        ]);
      }
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      title={
        <Typography.Title level={2} style={{ margin: 0 }}>
          Transaction Details
        </Typography.Title>
      }
      width={850}
      zIndex={2}
    >
      <Row gutter={[4, 0]}>
        <Col span={14}>
          {textData[0].map((_, i) => (
            <div style={{ display: "flex" }} key={i}>
              <div style={{ width: 250, fontSize: 20 }}>{_}:</div>
              <div style={{ width: 300, fontSize: 20 }}>{textData[1][i]}</div>
            </div>
          ))}
          {latestHistory() &&
          latestHistory()?.status == "failed" &&
          transaction?.history?.length != 0 ? (
            <div style={{ display: "flex" }} key="failed-transact-container">
              <div style={{ width: 250, fontSize: 20 }}>Reason/s:</div>
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
                {latestHistory()?.description}
              </div>
            </div>
          ) : null}
          {latestHistory()?.status == "completed" && (
            <Button
              onClick={handlePrint}
              style={{ marginTop: 25, paddingLeft: 30, paddingRight: 30 }}
              size="large"
            >
              PRINT
            </Button>
          )}
        </Col>
        <Col span={1}>
          <Divider type="vertical" style={{ height: "100%" }} />
        </Col>
        <Col span={9}>
          <Typography.Title level={4}>Status History</Typography.Title>
          {getStatusHistory()}
        </Col>
      </Row>
    </Modal>
  );
};

export default TransactionDetails;
