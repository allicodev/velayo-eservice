import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Select,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// TODO: auto disable wallet of biller settings in teller if encoder disable the wallet or biller

import { BillsPaymentProps, Branch, Portal, User } from "@/types";
import { FloatLabel } from "@/assets/ts";
import BillService from "@/provider/bill.service";
import EtcService from "@/provider/etc.service";
import { useUserStore } from "@/provider/context";
import PortalService from "@/provider/portal.service";
import LogService from "@/provider/log.service";

const EncoderForm = ({
  open,
  close,
  transaction,
  refresh,
  isMobile,
}: BillsPaymentProps) => {
  const [textData, setTextData] = useState<string[][]>([[], []]);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [isFailed, setIsFailed] = useState(false);
  const [isReceived, setIsReceived] = useState(true);
  const [reason, setReason] = useState("");
  const [refNumber, setRefNumber] = useState<string | null>("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [rebate, setRebate] = useState<number | null>(0);
  const [to, setTo] = useState<NodeJS.Timeout>();

  const { currentUser } = useUserStore();

  const getTransactionType = () => {
    if (transaction) {
      return JSON.parse(transaction.transactionDetails).transactionType;
    } else null;
  };

  const getTransactionBillerId = () => {
    if (transaction) {
      return JSON.parse(transaction.transactionDetails).billerId;
    } else null;
  };

  const lastStatus = () => transaction && transaction.history?.at(-1)?.status;

  const getFlex = (_: string, i: number) => {
    if (transaction?.type == "eload") {
      return ["Phone", "Amount", "Teller"].includes(_)
        ? lastStatus() == "completed" ||
          ["Teller", "Branch", "Amount"].includes(_)
          ? 3
          : 2
        : 3;
    } else if (transaction?.type == "wallet") {
      return (transaction?.sub_type?.includes("cash-out") ?? false) ||
        ["Type", "Biller", "Name", "Teller", "Branch"].includes(_)
        ? 3
        : 2;
    } else {
      if (["₱", "x", "(", ")"].every((e) => _.includes(e))) return 3;
      return [
        "Type",
        "Biller",
        "Teller",
        "Branch",
        "Portal",
        "Sender Name",
        "Sender Number/Account Number",
        "Amount",
        "Fee",
        "Biller",
        "Trace ID",
        ...(transaction?.type == "miscellaneous" ? ["Total"] : []),
      ].includes(_)
        ? 3
        : lastStatus() == "completed"
        ? 3
        : 2;
    }
  };

  const checkFlagMark = (_: string, i: number) => {
    if (_.includes("**")) return false;

    if (transaction?.type == "wallet") {
      return transaction?.sub_type?.includes("cash-out") ?? false
        ? false
        : !["Type", "Biller", "Name", "Teller", "Branch"].includes(_);
    } else
      return (
        transaction &&
        lastStatus() == "pending" &&
        ![
          "Type",
          "Promo",
          "Teller",
          "Branch",
          "Portal",
          "Sender Name",
          "Sender Number/Account Number",
          "Amount",
          "Fee",
          "Biller",
          "Trace ID",
          ...(transaction?.type == "miscellaneous" ? ["Total"] : []),
        ].includes(_) &&
        textData[0][i] != "Name"
      );
  };

  const handleUpdate = () => {
    let _transaction: any = transaction;
    delete _transaction.history;

    const getAmount = () => {
      if (transaction?.type == "wallet")
        return transaction.sub_type?.includes("cash-out")
          ? transaction?.amount ?? 0
          : -((transaction?.amount ?? 0) + (transaction.fee ?? 0));

      return (
        ((transaction?.amount ?? 0) + (transaction?.fee ?? 0)) *
        (transaction?.isOnlinePayment ? 1 : -1)
      );
    };

    if (!isFailed) {
      if (
        !_transaction?.sub_type?.includes("cash-out") &&
        refNumber == "" &&
        _transaction.type != "miscellaneous"
      ) {
        message.warning("Reference number is empty. Cannot update.");
        return;
      }

      (async (_) => {
        if (_transaction) {
          let res = await _.updateTransaction({
            ..._transaction,
            type: _transaction.type,
            encoderId: currentUser?._id ?? "",
            reference: refNumber!,
            $push: {
              history: {
                description: "Transaction completed",
                status: "completed",
                createdAt: new Date(),
              },
            },
          });

          if (res?.success ?? false) {
            // create a log that would negate the balance from portal balance

            let res2 = await LogService.newLog({
              userId: (transaction?.tellerId as any)?._id ?? "",
              type: "portal",
              portalId: selectedPortal?._id,
              amount: getAmount(),
              transactionId: transaction?._id,
              rebate,
            });

            if (res2?.success ?? false) {
              message.success(res?.message ?? "Success");
              if (refresh) refresh();
              setRefNumber(null);
              setIsFailed(false);
              setSelectedPortal(null);
              setRebate(null);
              close();
            }
          }
        }
      })(BillService);
    } else {
      (async (_) => {
        if (_transaction) {
          let res = await _.updateTransaction({
            ..._transaction,
            type: _transaction.type,
            encoderId: currentUser?._id ?? "",
            $push: {
              history: {
                description: reason,
                status: "failed",
                createdAt: new Date(),
              },
            },
          });

          if (res.success) {
            message.success(res?.message ?? "Success");
            if (refresh) refresh();
            close();
            setRebate(null);
            setSelectedPortal(null);
            setIsFailed(false);
          }
        }
      })(BillService);
    }
  };

  const fetchPortals = async () => {
    let _ =
      transaction?.type == "bills"
        ? "biller"
        : transaction?.type == "wallet"
        ? "wallet"
        : "eload";

    let res = await PortalService.getPortal({
      assignTo: [_],
      project: {
        name: 1,
        _id: 1,
        currentBalance: 1,
      },
    });

    if (res?.success ?? false) {
      setPortals(res?.data ?? []);

      // if (res?.data && res?.data?.length > 0) setSelectedPortal(res?.data[0]);
    }
  };

  const checkIfValid = () => {
    if (isDisabled) return true;
    if (
      isFailed ||
      (transaction?.type == "miscellaneous" && transaction.isOnlinePayment)
    )
      return false;
    if (transaction && transaction.type == "wallet") {
      if (
        transaction.sub_type?.split(" ")[1] == "cash-in" &&
        (selectedPortal == null ||
          selectedPortal.currentBalance < (transaction.amount ?? 0) ||
          ["", null].includes(refNumber) ||
          [0, null].includes(rebate))
      )
        return true;

      if (
        transaction.sub_type?.split(" ")[1] == "cash-out" &&
        (selectedPortal == null || [0, null].includes(rebate))
      )
        return true;
      return false;
    }

    if (!isFailed && ["", null].includes(refNumber)) return true;

    if (!["shopee", "miscellaneous"].includes(transaction?.type ?? "")) {
      if (
        selectedPortal == null ||
        (transaction &&
          transaction.type == "wallet" &&
          !transaction.sub_type?.includes("cash-out") &&
          (selectedPortal.currentBalance <= 0 ||
            selectedPortal.currentBalance < (transaction.amount ?? 0)))
      ) {
        return true;
      }

      if (
        transaction &&
        transaction.type != "wallet" &&
        ((rebate ?? 0) <= 0 || rebate == null)
      )
        return true;
    }

    return false;
  };

  useEffect(() => {
    if (open && transaction) {
      if (transaction.transactionDetails) {
        let _ = JSON.parse(transaction.transactionDetails);

        if (transaction.type == "miscellaneous")
          setTextData([
            [
              ...(isMobile ? [] : ["Type"]),
              "Total",
              ...(transaction.isOnlinePayment
                ? [
                    "Online Payment**",
                    "Portal",
                    "Sender Name",
                    "Sender Number/Account Number",
                    "Trace ID",
                  ]
                : []),
              "Others**",
              "Teller",
              "Branch",
            ],
            [
              ...(isMobile ? [] : [transaction.type.toLocaleUpperCase()]),
              `₱${transaction.amount}`,

              ...(transaction.isOnlinePayment
                ? [
                    "",
                    transaction.portal!,
                    transaction.receiverName!,
                    transaction.recieverNum!,
                    `${transaction.traceId?.slice(
                      0,
                      2
                    )}-${transaction.traceId?.slice(
                      2,
                      6
                    )}-${transaction.traceId?.slice(6, 10)}` ?? "N/A",
                  ]
                : []),
              "",
              `${(transaction.tellerId as User)?.name ?? "No Teller"}`,
              `${(transaction.branchId as Branch)?.name ?? "No Branch"}`,
            ],
          ]);
        else
          setTextData([
            [
              ...(isMobile ? [] : ["Type"]),
              "Biller",
              ...Object.keys(_)
                .filter(
                  (e: string) =>
                    ![
                      "billerId",
                      "transactionType",
                      "tellerId",
                      "amount",
                    ].includes(e)
                )
                .map((e) => {
                  return e
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((_) => _[0].toLocaleUpperCase() + _.slice(1))
                    .join(" ");
                }),
              "Amount",
              ...(transaction.isOnlinePayment
                ? [
                    "Online Payment**",
                    "Portal",
                    "Sender Name",
                    "Sender Number/Account Number",
                    "Trace ID",
                  ]
                : []),
              "Others**",
              "Teller",
              "Branch",
            ],
            [
              ...(isMobile
                ? []
                : [
                    transaction.type.toLocaleUpperCase() +
                      (transaction.isOnlinePayment ? " Online Payment" : ""),
                  ]),
              transaction.sub_type!.toLocaleUpperCase(),
              ...Object.keys(_)
                .filter(
                  (e: any) =>
                    ![
                      "billerId",
                      "transactionType",
                      "tellerId",
                      "amount",
                    ].includes(e)
                )
                .map((e: any) => {
                  if (transaction.type == "eload" && e == "fee")
                    return `₱${Number.parseFloat(_[e]).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`;
                  else if (typeof _[e] == "string" && _[e].includes("_money"))
                    return `₱${Number.parseFloat(
                      _[e].split("_")[0]
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;

                  return _[e];
                }),
              `₱${transaction.amount?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              ...(transaction.isOnlinePayment
                ? [
                    "",
                    transaction.portal,
                    transaction.receiverName,
                    transaction.recieverNum,
                    `${transaction.traceId?.slice(
                      0,
                      2
                    )}-${transaction.traceId?.slice(
                      2,
                      6
                    )}-${transaction.traceId?.slice(6, 10)}` ?? "N/A",
                  ]
                : []),
              "",
              (transaction.tellerId as User)?.name ?? "No Teller",
              (transaction.branchId as Branch)?.name ?? "No Branch",
            ],
          ]);
      }
    }
  }, [transaction, open]);

  useEffect(() => {
    if (open && transaction?.type != "eload") {
      const type = getTransactionType();
      const id = getTransactionBillerId();

      (async (_) => {
        let res = await _.checkIfDisabled(type, id);
        if (res.success ?? false) setIsDisabled(true);
        else setIsDisabled(false);
      })(EtcService);
    }
    if (open && !["shopee", "miscellaneous"].includes(transaction?.type ?? ""))
      fetchPortals();
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setSelectedPortal(null);
        setRefNumber(null);
        setRebate(null);
        close();
      }}
      footer={null}
      width={700}
      closable={false}
      title={
        isMobile ? (
          <div
            style={{
              background:
                transaction?.type == "wallet"
                  ? "#297BFA"
                  : transaction?.type == "bills"
                  ? "#28a745"
                  : transaction?.type == "shopee"
                  ? "#ee4d2d"
                  : transaction?.type == "eload"
                  ? "#4c772d"
                  : "#EFB40D",
              display: "block",
              textAlign: "center",
              padding: 5,
              color: "#fff",
              fontSize: "1.2em",
              borderRadius: 10,
            }}
          >
            {transaction?.type.toLocaleUpperCase()}{" "}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Typography.Title
              level={isMobile ? 3 : 2}
              style={{
                margin: 0,
                marginRight: 10,
              }}
            >
              Transaction Details
            </Typography.Title>
            {transaction?.type == "miscellaneous" &&
            transaction.history?.length == 1 &&
            lastStatus() == "completed" ? (
              <></>
            ) : (
              <>
                {transaction?.history?.at(-1)?.status == "completed" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 30,
                    }}
                  >
                    (Ref #:{" "}
                    <Typography.Link
                      style={{ marginLeft: 5 }}
                      onClick={() => {
                        navigator.clipboard
                          .writeText(transaction.reference!)
                          .then((e) => message.success("Copied Successfully"));
                      }}
                    >
                      {transaction.reference}
                    </Typography.Link>
                    )
                  </div>
                )}
              </>
            )}
          </div>
        )
      }
    >
      {isDisabled && (
        <Alert
          message="This Biller/EWallet has been disabled"
          type="warning"
          style={{
            marginBottom: 10,
          }}
        />
      )}
      <div
        style={{
          marginTop: isMobile ? 20 : 0,
        }}
      >
        {textData[0].map((_, i) => (
          <>
            <div
              style={{ display: "flex", justifyContent: "space-around" }}
              key={i}
            >
              <div
                style={{
                  width: 140,
                  fontSize: _.includes("**") ? "1.5em" : isMobile ? 18 : 20,
                  flex: 2,
                  marginTop:
                    _.includes("**") ||
                    ((transaction?.type == "miscellaneous" ?? false) &&
                      _.toLocaleLowerCase() == "current status")
                      ? 10
                      : 0,
                  textDecoration: _.includes("**") ? "underline" : "",
                }}
              >
                {_.includes("**") ||
                ["₱", "x", "(", ")"].every((e) => _.includes(e))
                  ? _.split("**")[0]
                  : `${_}:`}
              </div>
              <div
                style={{
                  width: 150,
                  fontSize: isMobile ? 18 : 20,
                  flex: getFlex(_, i),
                  // textAlign:
                  //   ["₱", "x", "(", ")"].every((e) => _.includes(e)) ||
                  //   _ == "Total"
                  //     ? "end"
                  //     : "start",
                }}
              >
                {textData[1][i]}
              </div>
              {checkFlagMark(_, i) ? (
                <div
                  style={{
                    flex: 1,
                  }}
                >
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
                      clearTimeout(to);
                      setCopiedIndex(i);
                      setTo(setTimeout(() => setCopiedIndex(-1), 2500));
                      let textToBeCopied: any = textData[1][i];

                      if (textData[1][i].includes("₱")) {
                        textToBeCopied = `${textData[1][i]
                          .split(",")
                          .join("")
                          .slice(1)}`;
                      }

                      navigator.clipboard
                        .writeText(textToBeCopied)
                        .then((e) => message.success("Copied Successfully"));
                    }}
                  >
                    {copiedIndex == i ? "Copied" : "Copy"}
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ))}
      </div>
      {/* conditional rendering */}

      {transaction && lastStatus() == "pending" ? (
        <>
          <div
            style={{
              marginTop: 10,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <div
              style={{ marginRight: 20 }}
              onClick={() => {
                setIsFailed(!isFailed);
                setIsReceived(false);
                setRebate(null);
              }}
            >
              <Checkbox checked={isFailed} style={{ marginRight: 5 }} /> Set
              Status Failed
            </div>
            {(transaction?.sub_type?.includes("cash-out") ||
              transaction.type == "miscellaneous") && (
              <div
                onClick={() => {
                  setIsFailed(false);
                  setIsReceived(true);
                }}
              >
                <Checkbox checked={isReceived} style={{ marginRight: 5 }} />{" "}
                Received
              </div>
            )}
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
                className="customInput special"
              />
            </FloatLabel>
          ) : (
            transaction.type != "miscellaneous" && (
              <div style={{ marginTop: 20 }}>
                <FloatLabel label="Reference Number" value={refNumber!}>
                  <Input
                    size="large"
                    value={refNumber!}
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
            )
          )}
          {!["shopee", "miscellaneous"].includes(transaction?.type ?? "") &&
            !isFailed && (
              <>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: "1.25em",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label style={{ marginRight: 10, width: 85 }}>
                    Portal Used:
                  </label>
                  <Select
                    size="large"
                    style={{ width: 150, marginRight: 25 }}
                    filterOption={(
                      input: string,
                      option?: { label: string; value: string }
                    ) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={portals.map((e) => ({
                      label: e.name,
                      value: e?._id ?? "",
                    }))}
                    value={selectedPortal?._id}
                    onChange={(_) => {
                      setSelectedPortal(portals.filter((e) => e._id == _)[0]);
                      setRebate(null);
                    }}
                    showSearch
                    allowClear
                  />
                  {selectedPortal
                    ? (selectedPortal.currentBalance <= 0 ||
                        selectedPortal.currentBalance <
                          (transaction.amount ?? 0)) && (
                        <Alert
                          description={
                            selectedPortal.currentBalance <= 0
                              ? "Selected Portal has no Balance"
                              : selectedPortal.currentBalance <
                                (transaction.amount ?? 0)
                              ? "Selected Portal has insufficient Balance"
                              : ""
                          }
                          type={
                            selectedPortal.currentBalance <= 0
                              ? "error"
                              : "warning"
                          }
                          style={{ height: 40, padding: 8 }}
                        />
                      )
                    : null}
                </div>
                {selectedPortal && (
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: "1.25em",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <label style={{ marginRight: 10, width: 85 }}>
                      Rebate:
                    </label>
                    <InputNumber
                      min={0}
                      size="large"
                      controls={false}
                      prefix="₱"
                      onChange={setRebate}
                      style={{
                        width: 150,
                      }}
                      formatter={(value: any) =>
                        value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </div>
                )}
              </>
            )}

          <Button
            type="primary"
            block
            onClick={handleUpdate}
            disabled={checkIfValid()}
            style={{
              marginTop: 10,
              height: 50,
              fontSize: "1.45em",
            }}
          >
            Update Transaction
          </Button>
          <span
            style={{
              color: "#8C8C8C",
              fontSize: isMobile ? 10 : 14,
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
            <div style={{ flex: 2, fontSize: isMobile ? 18 : 20 }}>
              Current Status:
            </div>
            <div style={{ flex: 3, fontSize: isMobile ? 18 : 20 }}>
              <Tag
                color={
                  transaction?.history?.at(-1)?.status == "failed"
                    ? "#f00"
                    : "#29A645"
                }
              >
                {transaction?.history?.at(-1)?.status == "failed"
                  ? "FAILED"
                  : "SUCCESS"}
              </Tag>
            </div>
          </div>
          {transaction?.history?.at(-1)?.status == "failed" && (
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
