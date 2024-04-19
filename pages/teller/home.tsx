import React, { useEffect, useState } from "react";
import { Button, Col, Row, Typography, notification } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { MdOutlineSendToMobile } from "react-icons/md";
import { FaMoneyBills } from "react-icons/fa6";
import { AiOutlineFileDone } from "react-icons/ai";

import { UserBadge, DashboardBtn } from "@/app/components";
import {
  WalletForm,
  TransactionHistory,
  TransactionDetails,
  BillsPayment,
} from "@/app/components/teller";

import { Eload as EloadProp, TransactionOptProps } from "@/types";
import { useUserStore } from "@/provider/context";
import { PusherFE } from "@/provider/utils/pusher";
import Eload from "@/app/components/teller/forms/eload_form";
import ShoppeForm from "@/app/components/teller/shoppe_form";

import BillService from "@/provider/bill.service";

const pusher = new PusherFE();
let pusherProvider: PusherFE;

const Teller = () => {
  const [openedMenu, setOpenedMenu] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [transactionDetailsOpt, setTransactionOpt] =
    useState<TransactionOptProps>({
      open: false,
      transaction: null,
    });

  const { currentUser } = useUserStore();

  const bill = new BillService();

  const menu = [
    {
      title: "Bills \nPayment",
      icon: (
        <FaMoneyBills
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("bills"),
    },
    {
      title: "Wallet Cash \nIn/out",
      icon: (
        <WalletOutlined
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("gcash"),
    },
    {
      title: "E-Load",
      icon: (
        <MdOutlineSendToMobile
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("eload"),
    },
    {
      title: "Shopee Self \nCollect",
      onPress: () => setOpenedMenu("shoppe"),
    },
    {
      title: "Transaction History",
      icon: (
        <AiOutlineFileDone
          className="db-btn"
          style={{ fontSize: 80, color: "#000" }}
        />
      ),
      onPress: () => setOpenedMenu("th"),
    },
    { title: "miscellaneous", onPress: () => {} },
  ];

  const initPusherProvider = () => {
    pusherProvider.bind("notify", handleNotify);
  };

  const handleNotify = (data: string) => {
    let { queue, id } = JSON.parse(data);

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
      let res = await bill.requestEload(eload);
      if (res.success) return true;
    })(bill);
  };

  useEffect(() => {
    if (!pusher.hasSubscribe) pusherProvider = pusher.subscribe("teller");

    initPusherProvider();
  }, []);

  useEffect(() => {
    (async () => {
      if (!(await checkServer())) {
        setIsPrinterConnected(false);
        return;
      } else {
        setIsPrinterConnected(true);
        return;
      }
    })();
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
            />
          </div>
          <div>
            <Row gutter={[32, 32]} style={{ padding: 20 }}>
              {menu.map((e, i) => (
                <Col span={8} key={`btn-${i}`}>
                  <DashboardBtn key={`btn-child-${i}`} {...e} />
                </Col>
              ))}
            </Row>
            <div className="printer-container">
              {isPrinterConnected ? (
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
        </div>
      </div>

      {/* context */}
      {contextHolder}
      <WalletForm
        open={openedMenu == "gcash"}
        close={() => setOpenedMenu("")}
      />
      <BillsPayment
        open={openedMenu == "bills"}
        close={() => setOpenedMenu("")}
      />
      <TransactionHistory
        open={openedMenu == "th"}
        close={() => setOpenedMenu("")}
        onCellClick={(e) => {
          setTransactionOpt({ open: true, transaction: e });
        }}
      />
      <TransactionDetails
        {...transactionDetailsOpt}
        close={() => setTransactionOpt({ open: false, transaction: null })}
      />
      <Eload
        open={openedMenu == "eload"}
        close={() => setOpenedMenu("")}
        onSubmit={handleEloadRequest}
      />
      <ShoppeForm
        open={openedMenu == "shoppe"}
        close={() => setOpenedMenu("")}
      />
    </>
  );
};

export default Teller;
