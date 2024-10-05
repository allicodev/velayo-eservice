import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Row, Tag, Typography, message, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Webcam from "react-webcam";
import dayjs from "dayjs";

// icons
import { WalletOutlined } from "@ant-design/icons";
import { MdOutlineSendToMobile } from "react-icons/md";
import { FaMoneyBills } from "react-icons/fa6";

import { UserBadge, DashboardBtn } from "@/app/components";
import {
  WalletPayment,
  TransactionHistory,
  TransactionDetails,
  BillsPayment,
} from "@/app/components/teller";

import {
  BranchData,
  Eload as EloadProp,
  Transaction,
  TransactionOptProps,
} from "@/types";
import { useItemStore, useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import Eload from "@/app/components/teller/forms/eload_form";
import ShoppeForm from "@/app/components/teller/shoppe_form";

import BillService from "@/provider/bill.service";
import PosHome from "@/app/components/pos/pos";
import ItemService from "@/provider/item.service";
import EtcService from "@/provider/etc.service";
import ModalQueue from "@/app/components/teller/modal_queue";
import WebCamera from "@/app/components/teller/webcam";
import COTracker from "@/app/components/teller/cashout_tracker";
import CreditTracker from "@/app/components/teller/credit-tracker";
import BranchBalanceInit from "@/app/components/teller/forms/balance_init";

// redux actions
import CashboxCard from "@/app/components/teller/cashbox/cashbox_card";
import Cashbox from "@/app/components/teller/cashbox/cashbox";
import LogService from "@/provider/log.service";
import { setLogs } from "@/app/state/logs.reducers";
import { RootState } from "@/app/state/store";

const Teller = () => {
  const [openedMenu, setOpenedMenu] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [lastQueue, setLastQueue] = useState(0);
  const [openQueue, setOpenQueue] = useState(false);
  const [openWebcam, setOpenWebCam] = useState(false);
  const [openCOTracker, setOpenCOTracker] = useState(false);
  const [openBranchBalanceInit, setOpenBranchBalanceInit] = useState(false);
  const [openCashBox, setOpenCashBox] = useState(false);

  const [transactionDetailsOpt, setTransactionOpt] =
    useState<TransactionOptProps>({
      open: false,
      transaction: null,
      requestId: null,
    });
  const webcamRef = useRef<Webcam>(null);

  const { currentUser, currentBranch, setPrinter, printerIsAlive } =
    useUserStore();
  const { setItems, lastDateUpdated, setLastDateUpdated, items } =
    useItemStore();

  const reduxBranch = useSelector((state: RootState) => state.branch);

  const dispatch = useDispatch();

  const menu = [
    {
      title: "Bills Payment \n [F1]",
      icon: (
        <FaMoneyBills
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("bills"),
    },
    {
      title: "Wallet Cash In/out  \n [F2]",
      icon: (
        <WalletOutlined
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("gcash"),
    },
    {
      title: "E-Load  \n [F3]",
      icon: (
        <MdOutlineSendToMobile
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("eload"),
    },
    {
      title: "Shopee Self Collect \n [F4]",
      onPress: () => setOpenedMenu("shoppe"),
    },
    {
      title: "Transaction History \n [F5]",
      onPress: () => setOpenedMenu("th"),
    },
    {
      title: "Miscellaneous \n [F6]",
      onPress: () => setOpenedMenu("pos"),
    },
  ];

  const initPusherProvider = () => {
    let channel = new Pusher().subscribe(
      `teller-${currentUser?._id.slice(-5)}`
    );
    channel.bind("notify", handleNotify);
    return () => {
      channel.unbind();
      channel.unsubscribe();
    };
  };

  const close = () => setOpenedMenu("");

  const handleNotify = (data: any) => {
    let { queue, id } = data;

    (async (_) => {
      let res = await _.getItems({ _id: currentBranch });

      if (res?.success ?? false) {
        let items = (res.data as BranchData[])?.at(0)?.items;
        let updatedData: any[] = [];

        (items ?? []).map((e) => {
          updatedData.push({
            ...e.itemId,
            quantity: e.stock_count,
          });
        });
        setItems(updatedData);
        setLastDateUpdated(dayjs());
        console.log("Items are refreshed");
      }
    })(ItemService);

    api.info({
      // message: `Transaction ID #${queue} has been updated`,
      message: "Some transaction has been updated",
      duration: 0,
      btn: (
        <Button
          type="primary"
          style={{ border: "none" }}
          ghost
          onClick={() => openTransaction(id)}
        >
          Open
        </Button>
      ),
    });
  };

  const openTransaction = (id: string) => {
    api.destroy();
    new Promise<void>((resolve, reject) => {
      setOpenedMenu("th");
      resolve();
    }).then(async () => {
      await (TransactionHistory as any).openTransaction(id);
    });
  };

  async function checkServer() {
    try {
      const response = await fetch("http://localhost:3001/");
      if (!response.ok) {
        throw new Error("Server is not available");
      }
    } catch (error) {
      return false;
    }
    return true;
  }

  const handleEloadRequest = (eload: EloadProp) => {
    return (async (_) => {
      let res = await _.requestEload(
        {
          ...eload,
          tellerId: currentUser?._id ?? "",
        },
        currentBranch
      );
      return res;
    })(BillService);
  };

  function handleKeyPress(event: KeyboardEvent) {
    const key = event.key;

    switch (key) {
      case "F1":
        setOpenedMenu("bills");
        break;
      case "F2":
        setOpenedMenu("gcash");
        break;
      case "F3":
        setOpenedMenu("eload");
        break;
      case "F4":
        setOpenedMenu("shoppe");
        break;
      case "F5":
        setOpenedMenu("th");
        break;
      case "F6":
        setOpenedMenu("pos");
        break;
      case "F7":
        setOpenedMenu("credit");
        break;
      case "F8":
        setOpenCOTracker(true);
        break;
      case "F9":
        setOpenWebCam(true);
        break;
      case "F10":
        setOpenQueue(true);
        break;
      default:
      // Handle other key presses
    }
  }

  useEffect(() => {
    return initPusherProvider();
  }, []);

  useEffect(() => {
    setPrinter(false);
    (async () => {
      if (!(await checkServer())) {
        setPrinter(false);
        return;
      } else {
        setPrinter(true);
        return;
      }
    })();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const minutes = 5; // change this to update the items per (x) minutes

    (async (_) => {
      let res = await _.getLastQueue(currentBranch);

      if (res?.success ?? false) {
        setLastQueue(res?.data ?? 0);
      }
    })(EtcService);

    if (
      Math.abs(dayjs(lastDateUpdated).diff(dayjs(), "minutes")) >= minutes ||
      lastDateUpdated == null ||
      items.length == 0
    ) {
      (async (_) => {
        let res = await _.getItems({ _id: currentBranch });

        if (res?.success ?? false) {
          let items = (res.data as BranchData[])?.at(0)?.items;
          let updatedData: any[] = [];

          (items ?? []).map((e) => {
            updatedData.push({
              ...e.itemId,
              quantity: e.stock_count,
            });
          });

          setItems(updatedData);
          setLastDateUpdated(dayjs());
          console.log("Items are refreshed");
        }
      })(ItemService);
    }

    (async (_) => {
      let {
        success,
        data,
        message: ApiMessage,
      } = await _.getLog({
        type: "disbursement",
        branchId: currentBranch,
        userId: currentUser?._id ?? null,
        fromDate: new Date(),
        toDate: new Date(),
        project: JSON.stringify({
          userId: 0,
          items: 0,
        }),
      });

      if (success) {
        if ((data || []).length > 0) {
          const balance = (data || []).reduce((p, n) => p + (n.amount ?? 0), 0);

          if (balance <= 0) setOpenBranchBalanceInit(true);
          else {
            // sort it out via is_initial_balance before dispatch

            data = (data || []).sort((a, b) => {
              let _a = JSON.parse(a.attributes ?? "{}");
              let _b = JSON.parse(b.attributes ?? "{}");

              if (_a.is_initial_balance) return -1;
              if (_b.is_initial_balance) return 1;
              return 0;
            });

            dispatch(
              setLogs({
                key: "cash",
                logs: (data || []).map((ea) => ({
                  ...ea,
                  transactionId: {
                    ...(ea.transactionId as Transaction),
                    branchId: ea.branchId,
                  },
                })) as any,
              })
            );
          }
        } else setOpenBranchBalanceInit(true);
      } else {
        message.error(ApiMessage ?? "Error in the Server");
      }
    })(LogService);
  }, []);

  return (
    <>
      <div className="teller main-content">
        <div
          className="body-content"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <div>
            <UserBadge
              name={currentUser?.name ?? ""}
              title={
                currentUser
                  ? `${currentUser.role[0].toLocaleUpperCase()}${currentUser.role.slice(
                      1
                    )}`
                  : null
              }
              style={{
                marginTop: 25,
                marginLeft: 25,
                marginRight: 25,
              }}
              role={currentUser?.role}
              setOpenedMenu={setOpenedMenu}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <div
                style={{
                  marginLeft: 20,
                  fontFamily: "abel",
                  fontSize: "1.2em",
                }}
              >
                Latest transaction queue:{" "}
                <span
                  style={{
                    background: "#98c04b",
                    color: "#fff",
                    paddingTop: 3,
                    paddingBottom: 3,
                    paddingRight: 7,
                    paddingLeft: 7,
                    fontWeight: 700,
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => setOpenQueue(true)}
                >
                  {lastQueue}
                </span>
              </div>

              <div
                style={{
                  marginRight: 20,
                }}
                onClick={() => setOpenCashBox(true)}
              >
                <CashboxCard />
              </div>
            </div>
            <Row gutter={[32, 32]} style={{ padding: 20 }}>
              {menu.map((e, i) => (
                <Col span={8} key={`btn-${i}`}>
                  <DashboardBtn key={`btn-child-${i}`} {...e} />
                </Col>
              ))}
            </Row>
            <div
              style={{
                display: "flex",
                marginBottom: 15,
                marginLeft: 20,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginRight: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontFamily: "abel", fontSize: "1em" }}>
                    Selected Branch:{" "}
                    <Tag
                      color="success"
                      style={{
                        fontSize: "1em",
                        padding: 5,
                      }}
                    >
                      {reduxBranch.currentBranch?.name ?? ""}
                    </Tag>
                  </div>
                  <div className="printer-container">
                    {printerIsAlive ? (
                      <Typography.Text
                        style={{
                          paddingRight: 8,
                          paddingLeft: 8,
                          paddingTop: 5,
                          paddingBottom: 5,
                          border: "1px solid #a1a1a1",
                          borderRadius: 5,
                          cursor: "default",
                          background: "#28a745",
                          color: "#fff",
                        }}
                      >
                        CONNECTED TO PRINTER
                      </Typography.Text>
                    ) : (
                      <Typography.Text
                        style={{
                          paddingRight: 8,
                          paddingLeft: 8,
                          paddingTop: 5,
                          paddingBottom: 5,
                          border: "1px solid grey",
                          borderRadius: 5,
                          cursor: "default",
                        }}
                      >
                        Printer is not connected
                      </Typography.Text>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontFamily: "abel" }}>
                    <span
                      style={{
                        fontSize: "1.2em",
                        fontWeight: 700,
                      }}
                    >
                      [F7]
                    </span>{" "}
                    - Credit
                  </span>
                  <span style={{ fontFamily: "abel" }}>
                    <span
                      style={{
                        fontSize: "1.2em",
                        fontWeight: 700,
                      }}
                    >
                      [F8]
                    </span>{" "}
                    - Track Transaction
                  </span>
                  <span style={{ fontFamily: "abel" }}>
                    <span
                      style={{
                        fontSize: "1.2em",
                        fontWeight: 700,
                      }}
                    >
                      [F9]
                    </span>{" "}
                    - Attendance
                  </span>
                  <span style={{ fontFamily: "abel" }}>
                    <span
                      style={{
                        fontSize: "1.2em",
                        fontWeight: 700,
                      }}
                    >
                      [F10]
                    </span>{" "}
                    - Queue Modal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* context */}
      {contextHolder}
      <WalletPayment open={openedMenu == "gcash"} close={close} />
      <BillsPayment open={openedMenu == "bills"} close={close} />
      <TransactionHistory
        open={openedMenu == "th"}
        close={close}
        onCellClick={(e, requestId) => {
          if (e == null) {
            message.error("Transaction not found.");
            return;
          }
          setTransactionOpt({ open: true, transaction: e, requestId });
        }}
      />
      <TransactionDetails
        {...transactionDetailsOpt}
        close={() => setTransactionOpt({ open: false, transaction: null })}
      />
      <Eload
        open={openedMenu == "eload"}
        close={close}
        onSubmit={handleEloadRequest}
      />
      <ShoppeForm
        open={openedMenu == "shoppe"}
        close={() => setOpenedMenu("")}
      />
      <PosHome open={openedMenu == "pos"} close={close} />
      <ModalQueue
        open={openQueue}
        close={() => setOpenQueue(false)}
        branchId={currentBranch}
      />
      <WebCamera
        open={openWebcam}
        close={() => setOpenWebCam(false)}
        webcamRef={webcamRef}
      />
      <COTracker
        open={openCOTracker}
        close={() => setOpenCOTracker(false)}
        setOpenedMenu={setOpenedMenu!}
      />
      <CreditTracker
        open={openedMenu == "credit"}
        close={() => setOpenedMenu("")}
      />
      <BranchBalanceInit
        open={openBranchBalanceInit}
        close={() => setOpenBranchBalanceInit(false)}
      />
      <Cashbox
        open={openCashBox}
        close={() => setOpenCashBox(false)}
        setTransactionOpt={setTransactionOpt}
      />
    </>
  );
};

export default Teller;
