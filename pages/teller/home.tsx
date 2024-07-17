import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Row, Tag, Typography, notification } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { MdOutlineSendToMobile } from "react-icons/md";
import { FaMoneyBills } from "react-icons/fa6";
import Webcam from "react-webcam";
import dayjs from "dayjs";

import { UserBadge, DashboardBtn } from "@/app/components";
import {
  WalletForm,
  TransactionHistory,
  TransactionDetails,
  BillsPayment,
} from "@/app/components/teller";

import { BranchData, Eload as EloadProp, TransactionOptProps } from "@/types";
import { useItemStore, useUserStore } from "@/provider/context";
import { Pusher } from "@/provider/utils/pusher";
import Eload from "@/app/components/teller/forms/eload_form";
import ShoppeForm from "@/app/components/teller/shoppe_form";

import BillService from "@/provider/bill.service";
import BranchService from "@/provider/branch.service";
import PosHome from "@/app/components/pos/pos";
import ItemService from "@/provider/item.service";
import EtcService from "@/provider/etc.service";
import ModalQueue from "@/app/components/teller/modal_queue";
import WebCamera from "@/app/components/teller/webcam";
import COTracker from "@/app/components/teller/cashout_tracker";

const Teller = () => {
  const [openedMenu, setOpenedMenu] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [brans, setBrans] = useState<BranchData | null>(null);
  const [lastQueue, setLastQueue] = useState(0);
  const [openQueue, setOpenQueue] = useState(false);
  const [openWebcam, setOpenWebCam] = useState(false);
  const [openCOTracker, setOpenCOTracker] = useState(false);
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

  const menu = [
    {
      title: "Bills Payment \n (F1)",
      icon: (
        <FaMoneyBills
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("bills"),
    },
    {
      title: "Wallet Cash In/out  \n (F2)",
      icon: (
        <WalletOutlined
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("gcash"),
    },
    {
      title: "E-Load  \n (F3)",
      icon: (
        <MdOutlineSendToMobile
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("eload"),
    },
    {
      title: "Shopee Self Collect \n (F4)",
      onPress: () => setOpenedMenu("shoppe"),
    },
    {
      title: "Transaction History \n (F5)",
      onPress: () => setOpenedMenu("th"),
    },
    {
      title: "Miscellaneous \n (F6)",
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

    api.info({
      message: `Transaction ID #${queue} has been updated`,
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
      return res.success ?? false;
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
      let res = await _.getBranchSpecific(currentBranch);

      if (res?.success ?? false) setBrans(res?.data ?? null);
    })(BranchService);

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
                      {brans?.name}
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
      <WalletForm open={openedMenu == "gcash"} close={close} />
      <BillsPayment open={openedMenu == "bills"} close={close} />
      <TransactionHistory
        open={openedMenu == "th"}
        close={close}
        onCellClick={(e, requestId) => {
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
    </>
  );
};

export default Teller;
