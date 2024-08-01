import React, { useEffect, useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Segmented,
  Table,
  TableProps,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

import { LogData, UserCreditData } from "@/types";
import CreditService from "@/provider/credit.service";
import dayjs from "dayjs";
import LogService from "@/provider/log.service";
import TransactionHistory from "./transaction_history";
import { useUserStore } from "@/provider/context";

interface MyProp {
  open: boolean;
  close: () => void;
}

const CreditTracker = ({ open, close }: MyProp) => {
  const [users, setUsers] = useState<UserCreditData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCreditData | null>(null);
  const [creditLog, setCreditLog] = useState<LogData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [tab, setTab] = useState("credit");

  const [isFetching, setIsFetching] = useState(false);
  const [openNewPayment, setOpenNewPayment] = useState(false);
  const [paymentVal, setPaymentVal] = useState(0);
  const [trigger, setTrigger] = useState(0);

  // * for amount history
  const [openAmountHistory, setOpenAmountHistory] = useState({
    open: false,
    logId: "",
  });

  const { currentUser, currentBranch } = useUserStore();

  const refresh = () => setTrigger(trigger + 1);

  const columns: TableProps<LogData>["columns"] = [
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div>
            ₱{" "}
            <span
              style={{
                textDecoration:
                  row.status == "completed" ? "line-through" : undefined,
              }}
            >
              {row
                .history!.reduce(
                  (p, n) => p + parseFloat(n.amount.toString()),
                  0
                )
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </span>
          </div>
          <Tooltip title="Show Payment History">
            <Button
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenAmountHistory({ open: true, logId: row._id });
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Interest",
      dataIndex: "interest",
      width: 100,
      align: "center",
      render: (_) => _ + "% / day",
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 100,
      render: (_, row) =>
        dayjs(row.dueDate).isBefore(dayjs()) && _ != "completed" ? (
          <Tag color="red-inverse">DUE</Tag>
        ) : _ == "completed" ? (
          <Tag color="green-inverse">PAID</Tag>
        ) : (
          <Tag color="orange-inverse">PENDING</Tag>
        ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (_) => dayjs(_).format("MMM DD, YYYY - hh:mma"),
    },
  ];

  const columns2: TableProps<LogData>["columns"] = [
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_) =>
        "₱ " +
        _.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (_) => dayjs(_).format("MMM DD, YYYY - hh:mma"),
    },
  ];

  const processWithTotal = (u: UserCreditData): UserCreditData => {
    u.availableCredit =
      u.history == null || u.history.length == 0
        ? u.maxCredit
        : u.history.reduce(
            (p, n) =>
              p -
              (n.status == "completed"
                ? 0
                : n.history.reduce(
                    (pp, nn) => pp + parseFloat(nn.amount.toString()),
                    0
                  )),
            u.maxCredit
          );

    return u;
  };

  const runTimer = (searchWord: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => searchUser(searchWord), 100);
  };

  const searchUser = async (searchWord: string) => {
    let res = await CreditService.getUser({ searchWord });

    if (res?.success ?? false) {
      setUsers(res?.data?.map((e) => processWithTotal(e)) ?? []);
    }
  };

  const getTotal = () => {
    if (selectedUser == null) return 0;
    else {
      return logs.reduce(
        (p, n) =>
          tab == "credit"
            ? n.status == "pending"
              ? p +
                n.history!.reduce(
                  (p, n) => p + parseFloat(n.amount.toString()),
                  0
                )
              : 0
            : p + n.amount!,
        0
      );
    }
  };

  const fetchLogs = async (type: string) => {
    setIsFetching(true);
    let res = await LogService.getLog({
      page: 1,
      pageSize: 99999,
      type,
      userCreditId: selectedUser?._id,
    });

    if (res?.success ?? false) {
      setLogs(
        res?.data?.sort((a, b) =>
          dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1
        ) ?? []
      );
      if (type == "credit")
        setCreditLog(
          res?.data?.sort((a, b) =>
            dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1
          ) ?? []
        );
    }
    setIsFetching(false);
  };

  const handleNewPayment = async () => {
    let res = await LogService.newLog({
      userId: currentUser?._id ?? "",
      type: "credit_payment",
      branchId: currentBranch,
      userCreditId: selectedUser!._id,
      amount: paymentVal,
    });

    if (res?.success ?? false) {
      setPaymentVal(0);
      setOpenNewPayment(false);
      message.success(res?.message ?? "Success");
      refresh();
    }
  };

  useEffect(() => {
    if (selectedUser != null)
      fetchLogs(tab == "credit" ? "credit" : "credit_payment");
  }, [selectedUser, tab, trigger]);

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography.Title level={3}>Credit Tracker</Typography.Title>
            {selectedUser != null && (
              <Button
                size="large"
                type="primary"
                onClick={() => setOpenNewPayment(true)}
              >
                New Payment
              </Button>
            )}
          </div>
        }
        open={open}
        onCancel={() => {
          setSelectedUser(null);
          setLogs([]);
          close();
        }}
        footer={null}
        closable={false}
        width={650}
        zIndex={1}
        destroyOnClose
      >
        <AutoComplete
          size="large"
          className="ctmFontSize"
          placeholder="Search User"
          style={{
            width: "100%",
            height: 50,
            fontSize: "1.5em",
            marginTop: 10,
          }}
          filterOption={(inputValue, option) =>
            option!
              .value!.toString()
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
          options={users
            // .filter((e) => selectedItem.map((_) => _._id).some((_) => _ == e._id)) // ! not working
            .map((e) => ({
              label: (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{e.name + " " + e.middlename + " " + e.lastname}</span>
                  <span>
                    Available Credits:{" "}
                    <strong>
                      ₱
                      {e.availableCredit?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                </div>
              ),
              value: e.name + " " + e.middlename + " " + e.lastname,
              key: e._id,
            }))}
          onChange={(e) => {
            if (e != "") {
              runTimer(e);
            } else setSelectedUser(null);
          }}
          onSelect={(_, __) => {
            setSelectedUser(users.filter((e) => e._id == __.key)[0]);
          }}
          autoFocus
          allowClear
        />
        {selectedUser != null && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Segmented
                style={{
                  marginTop: 5,
                  fontSize: "1.5em",
                  padding: 5,
                }}
                options={[
                  { label: "Credit", value: "credit" },
                  { label: "Payments", value: "payments" },
                ]}
                onChange={setTab}
              />
              <Typography.Text
                style={{
                  fontSize: "1.35em",
                  height: 30,
                  alignSelf: "flex-end",
                }}
                strong
              >
                Available Credits: ₱{" "}
                {selectedUser.availableCredit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography.Text>
            </div>

            {tab == "credit" && (
              <Table
                style={{ marginTop: 10, cursor: "pointer" }}
                columns={columns}
                loading={isFetching}
                dataSource={logs}
                rowKey={(e) => e?._id}
                onRow={(data) => {
                  return {
                    onClick: async () =>
                      await (TransactionHistory as any).openTransaction(
                        data.transactionId
                      ),
                  };
                }}
                components={{
                  body: {
                    row: (prop: any) => (
                      <Tooltip title="Click to view Transaction">
                        <tr {...prop} />
                      </Tooltip>
                    ),
                  },
                }}
                scroll={{
                  y: "30vh",
                }}
                pagination={false}
                summary={(data) => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        Total: ₱
                        {getTotal().toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
                bordered
              />
            )}
          </>
        )}
        {tab == "payments" && (
          <Table
            style={{ marginTop: 10 }}
            columns={columns2}
            loading={isFetching}
            dataSource={logs}
            rowKey={(e) => e?._id}
            scroll={{
              y: "30vh",
            }}
            summary={(data) => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    Total: ₱
                    {getTotal().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
            bordered
          />
        )}
      </Modal>

      {/* etc */}
      <Modal
        open={openNewPayment}
        onCancel={() => {
          setOpenNewPayment(false);
          setPaymentVal(0);
        }}
        title={<Typography.Title level={3}>New Payment</Typography.Title>}
        footer={
          <Button
            size="large"
            type="primary"
            disabled={paymentVal < 1}
            onClick={handleNewPayment}
            block
          >
            SUBMIT
          </Button>
        }
        closable={false}
        width={250}
        zIndex={2}
        destroyOnClose
      >
        <InputNumber
          formatter={(value: any) =>
            value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
          onChange={setPaymentVal}
          controls={false}
          className="customInput"
          size="large"
          prefix="₱"
          style={{
            width: "100%",
          }}
        />
        <span
          style={{
            display: "block",
            textAlign: "center",
            color: "#aaa",
          }}
        >
          credit payment: ₱
          {creditLog
            .reduce(
              (p, n) =>
                n.status == "pending"
                  ? p +
                    n.history!.reduce(
                      (p, n) => p + parseFloat(n.amount.toString()),
                      0
                    )
                  : 0,
              0
            )
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </span>
      </Modal>
      <Modal
        open={openAmountHistory.open}
        onCancel={() => setOpenAmountHistory({ open: false, logId: "" })}
        closable={false}
        zIndex={2}
        width={650}
        footer={null}
        destroyOnClose
      >
        <Row gutter={8}>
          <Col span={11}>
            <Timeline
              mode="left"
              className="no-scrollbar"
              style={{
                maxHeight: "50vh",
                overflow: "scroll",
                padding: 25,
              }}
              items={
                logs.length > 0 && openAmountHistory.logId != ""
                  ? logs
                      .filter((e) => e._id == openAmountHistory.logId)[0]
                      .history!.map((e) => ({
                        label: dayjs(e.date).format("MMM DD, YYYY hh:mma"),
                        children: (
                          <>
                            <p>{e.description}</p>
                            <p
                              style={{ color: e.amount > 0 ? "green" : "red" }}
                            >
                              {e.amount > 0 ? "+ " : "- "}₱
                              {Math.abs(e.amount).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </>
                        ),
                      }))
                  : []
              }
            />
          </Col>
          <Col span={2}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          {logs.length > 0 && openAmountHistory.logId != "" && (
            <Col span={11}>
              <div
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 10,
                  display: "inline-block",
                  padding: "10px 10px",
                  fontSize: "2.5em",
                  width: 200,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <span style={{ color: "#777" }}>
                  ₱
                  {logs
                    .filter((e) => e._id == openAmountHistory.logId)[0]
                    .amount?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    fontSize: "0.5em",
                    background: "#fff",
                    padding: "3px 5px",
                    borderRadius: 10,
                    lineHeight: 1,
                    display: "inline-block",
                    transform: "translateX(-50%)",
                  }}
                >
                  Base Amount
                </span>
              </div>
              <Divider />
              <div
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 10,
                  display: "inline-block",
                  padding: "10px 10px",
                  fontSize: "2.5em",
                  width: 200,
                  textAlign: "center",
                  position: "relative",
                  marginTop: 20,
                }}
              >
                <span style={{ color: "#777" }}>
                  {
                    logs
                      .filter((e) => e._id == openAmountHistory.logId)[0]
                      .history!.filter((e) =>
                        e.description.toLocaleLowerCase().includes("interest")
                      ).length
                  }
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    lineHeight: 1,
                    left: "50%",
                    fontSize: "0.5em",
                    background: "#fff",
                    padding: "3px 5px",
                    borderRadius: 10,
                    width: "80%",
                    transform: "translateX(-50%)",
                  }}
                >
                  No. of Overdue Days
                </span>
              </div>
              <div
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 10,
                  display: "inline-block",
                  padding: "10px 10px",
                  fontSize: "2.5em",
                  width: 200,
                  textAlign: "center",
                  position: "relative",
                  marginTop: 20,
                }}
              >
                <span style={{ color: "#777" }}>
                  ₱
                  {logs
                    .filter((e) => e._id == openAmountHistory.logId)[0]
                    .history!.filter((e) =>
                      e.description.toLocaleLowerCase().includes("interest")
                    )
                    .reduce((p, n) => p + parseFloat(n.amount.toString()), 0)
                    .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    lineHeight: 1,
                    left: "50%",
                    fontSize: "0.5em",
                    background: "#fff",
                    padding: "3px 5px",
                    borderRadius: 10,
                    transform: "translateX(-50%)",
                  }}
                >
                  Interest
                </span>
              </div>
              <div
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 10,
                  display: "inline-block",
                  padding: "10px 10px",
                  fontSize: "2.5em",
                  width: 200,
                  textAlign: "center",
                  position: "relative",
                  marginTop: 20,
                }}
              >
                <span style={{ color: "#777" }}>
                  ₱
                  {Math.abs(
                    logs
                      .filter((e) => e._id == openAmountHistory.logId)[0]
                      .history!.reduce(
                        (p, n) => p + parseFloat(n.amount.toString()),
                        0
                      )
                  ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    lineHeight: 1,
                    left: "50%",
                    fontSize: "0.5em",
                    background: "#fff",
                    padding: "3px 5px",
                    borderRadius: 10,
                    transform: "translateX(-50%)",
                  }}
                >
                  Total
                </span>
              </div>
            </Col>
          )}
        </Row>
      </Modal>
    </>
  );
};

export default CreditTracker;
