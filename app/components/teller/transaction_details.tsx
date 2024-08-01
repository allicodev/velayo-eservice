import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Input,
  Modal,
  Row,
  Timeline,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import PrinterService from "@/provider/printer.service";
import {
  Branch,
  Credit,
  TransactionDetailsProps,
  TransactionHistoryDataType_type,
  TransactionPOS,
  User,
  UserCreditData,
} from "@/types";
import { FloatLabel, transactionToPrinter } from "@/assets/ts";
import { useUserStore } from "@/provider/context";
import BillService from "@/provider/bill.service";
import EtcService from "@/provider/etc.service";

const TransactionDetails = ({
  open,
  close,
  transaction,
  requestId,
}: TransactionDetailsProps) => {
  const [textData, setTextData] = useState<[string[], any[]]>([[], []]);
  const [traceNum, setTraceNum] = useState("");

  const latestHistory = () => transaction?.history?.at(-1);
  const { currentBranch, currentUser, printerIsAlive } = useUserStore();

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

  const getStatusBadgeCredit = (
    status: "completed" | "pending",
    isDue?: boolean
  ) => (
    <div
      style={{
        padding: 2,
        paddingLeft: 15,
        paddingRight: 15,
        color: "#fff",
        display: "inline-block",
        borderRadius: 10,
        fontSize: "0.85em",
        backgroundColor: isDue
          ? "red"
          : status == "completed"
          ? "green"
          : "orange",
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
          label: dayjs(e.createdAt).format("MMM DD, YYYY - hh:mma"),
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
    if (printerIsAlive)
      if (transaction?.type != "miscellaneous")
        (async (_) => {
          if (transaction) {
            let printData = await transactionToPrinter(transaction);
            let { data } = await _.printReceipt({
              printData,
              tellerId: currentUser?.name ?? "",
              branchId: currentBranch,
            });

            if (data?.success ?? false) {
              message.success(data?.message ?? "Success");
            }
          }
        })(PrinterService);
      else {
        (async (_) => {
          await _.printReceiptPos({
            printData: {
              itemDetails: transaction.transactionDetails,
              amount: transaction?.amount ?? 0,
              cash: (transaction as TransactionPOS).cash,
              receiptNo:
                `3772-${parseInt(
                  transaction!._id!.slice(-8).toString(),
                  16
                )}` ?? "",
              refNo: "",
            },
            tellerId: currentUser?.name ?? "",
            branchId: currentBranch,
          });
        })(PrinterService);
      }
    else {
      message.error("Print Error. Printer server is offline");
      return;
    }
  };

  const handleRequestToEncoder = async () => {
    let res = await BillService.updateTransactionSpecific({
      _id: transaction?._id,
      tellerId: currentUser?._id,
      $push: {
        history: {
          description: `First Transaction Requested confirmed by Teller ${
            currentUser?.name ?? ""
          }`,
          status: "pending",
          createdAt: new Date(),
        },
      },
      traceId: traceNum,
    });

    if (res?.success ?? false) {
      message.success("Successfully Confirmed");
      if (requestId != null) await EtcService.markCompleted(requestId);
      close();
    }
  };

  useEffect(() => {
    if (open && transaction) {
      if (transaction.transactionDetails) {
        let _ = JSON.parse(transaction.transactionDetails);
        if (transaction.type == "miscellaneous")
          setTextData([
            [
              "Type",
              "Teller",
              "Request Date",
              "Items**",
              ..._.map((e: any) => e.name),
              "Total",
              ...(transaction.isOnlinePayment
                ? [
                    "Online Payment**",
                    "Portal",
                    "Sender Name",
                    "Sender Number/Account Number",
                  ]
                : []),
              ...(transaction.creditId != null ? [] : ["Current Status"]),
            ],
            [
              transaction.type.toLocaleUpperCase(),
              `${(transaction.tellerId as User)?.name ?? "No Teller"} (${
                (transaction.branchId as Branch)?.name ?? "No Branch"
              })` ?? "No Teller",
              dayjs(transaction?.createdAt).format("MMMM DD, YYYY - hh:mma"),
              "",
              ..._.map((e: any) => (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <span style={{ width: 120 }}>{`₱${(
                    e.quantity * e.price
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}</span>
                  <span>{`₱${e.price} x ${e.quantity}${e.unit}`}</span>
                </div>
              )),
              `₱${
                transaction.type == "miscellaneous"
                  ? (transaction.amount ?? 0) + (transaction.fee ?? 0)
                  : transaction.amount
              }`,
              ...(transaction.isOnlinePayment
                ? [
                    "",
                    transaction.portal,
                    transaction.receiverName,
                    transaction.recieverNum,
                  ]
                : []),
              ...(transaction.creditId != null
                ? []
                : [getStatusBadge(latestHistory()!.status)]),
            ],
          ]);
        else
          setTextData([
            [
              "Type",
              "Biller",
              "Teller",
              "Request Date",
              ...(transaction.creditId != null ? [] : ["Current Status"]),
              "Other Details**",
              ...Object.keys(_)
                .filter(
                  (e: any) =>
                    ![
                      "billerId",
                      "transactionType",
                      "tellerId",
                      "traceId",
                    ].includes(e)
                )
                .map((e) =>
                  e
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
                    .join(" ")
                ),
              ...(transaction.isOnlinePayment
                ? [
                    "Online Payment**",
                    "Portal",
                    "Sender Name",
                    "Sender Number/Account Number",
                  ]
                : []),
              ...(transaction.creditId != null
                ? ["Credit Details**", "Name", "Status"]
                : []),
            ],
            [
              transaction.type.toLocaleUpperCase(),
              transaction.sub_type?.toLocaleUpperCase() ?? "N/A",
              `${(transaction.tellerId as User)?.name ?? "No Teller"} (${
                (transaction.branchId as Branch)?.name ?? "No Branch"
              })` ?? "No Teller",
              dayjs(transaction?.createdAt).format("MMMM DD, YYYY - hh:mma"),
              ...(transaction.creditId != null
                ? []
                : [getStatusBadge(latestHistory()!.status)]),
              "",
              ...Object.keys(_)
                .filter(
                  (e: any) =>
                    ![
                      "billerId",
                      "transactionType",
                      "tellerId",
                      "traceId",
                    ].includes(e)
                )
                .map((e: any) => {
                  if (typeof _[e] == "string" && _[e].includes("_money"))
                    return `₱${parseInt(_[e].split("_")[0]).toLocaleString()}`;
                  // if (typeof e == "string" && e.startsWith("09"))
                  //   return `+${63}${e.slice(1)}`;
                  return _[e];
                }),

              ...(transaction.isOnlinePayment
                ? [
                    "",
                    transaction.portal,
                    transaction.receiverName,
                    transaction.recieverNum,
                  ]
                : []),
              ...(transaction.creditId != null
                ? [
                    "",
                    (
                      (transaction.creditId as Credit)
                        .userCreditId as UserCreditData
                    ).name +
                      (
                        (transaction.creditId as Credit)
                          .userCreditId as UserCreditData
                      ).middlename +
                      " " +
                      (
                        (transaction.creditId as Credit)
                          .userCreditId as UserCreditData
                      ).lastname,
                    getStatusBadgeCredit(
                      (transaction.creditId as Credit).status,
                      dayjs(transaction.createdAt)
                        .add(
                          (
                            (transaction.creditId as Credit)
                              .userCreditId as UserCreditData
                          ).creditTerm,
                          "day"
                        )
                        .isBefore(dayjs())
                    ),
                  ]
                : []),
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
      width={950}
      zIndex={99}
    >
      <Row gutter={[4, 0]}>
        <Col span={14}>
          {textData[0].map((_, i) => (
            <div style={{ display: "flex" }} key={i}>
              <div
                style={{
                  width: 350,
                  fontSize: 20,
                  marginTop:
                    _.includes("**") ||
                    ((transaction?.type == "miscellaneous" ?? false) &&
                      _.toLocaleLowerCase() == "current status")
                      ? 10
                      : 0,
                  textDecoration: _.includes("**") ? "underline" : "",
                }}
              >
                {_.includes("**") ? _.split("**")[0] : `${_}:`}
              </div>
              <div
                style={{
                  width: 300,
                  fontSize: 20,
                  marginTop:
                    (transaction?.type == "miscellaneous" ?? false) &&
                    _.toLocaleLowerCase() == "current status"
                      ? 10
                      : 0,
                }}
              >
                {textData[1][i]}
              </div>
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

          {transaction?.type == "wallet" &&
            transaction.sub_type?.includes("cash-in") &&
            latestHistory()?.status != "request" && (
              <div style={{ display: "flex", marginTop: 15 }}>
                <div
                  style={{
                    width: 350,
                    fontSize: 20,
                  }}
                >
                  Reference Number:
                </div>
                <div
                  style={{
                    width: 300,
                    fontSize: 20,
                  }}
                >
                  {transaction.reference}
                </div>
              </div>
            )}

          {latestHistory()?.status == "completed" && (
            <Button
              onClick={handlePrint}
              style={{ marginTop: 25, paddingLeft: 30, paddingRight: 30 }}
              size="large"
            >
              PRINT
            </Button>
          )}

          {latestHistory()?.status == "request" && (
            <div style={{ marginTop: 25, paddingRight: 30 }}>
              {transaction?.isOnlinePayment && (
                <FloatLabel
                  value={traceNum}
                  label="Trace ID (date, time, last 4 digits) (e.g 2312121234)"
                >
                  <Input
                    className="customInput"
                    value={traceNum}
                    maxLength={10}
                    minLength={10}
                    style={{
                      fontSize: "1.5em",
                    }}
                    onChange={(e) => {
                      if (e.target.value == "") setTraceNum("");

                      if (!Number.isNaN(Number(e.target.value)))
                        setTraceNum(e.target.value);
                    }}
                  />
                </FloatLabel>
              )}
              <Button
                onClick={handleRequestToEncoder}
                size="large"
                type="primary"
                disabled={transaction?.isOnlinePayment && traceNum.length < 10}
              >
                Confirm and Send to Encoder
              </Button>
            </div>
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
