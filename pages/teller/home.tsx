import React, { useEffect, useState } from "react";
import { Button, Col, Row, notification } from "antd";
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
              margin: 25,
            }}
          />
          <Row gutter={[32, 32]} style={{ padding: 20 }}>
            {menu.map((e, i) => (
              <Col span={8} key={`btn-${i}`}>
                <DashboardBtn key={`btn-child-${i}`} {...e} />
              </Col>
            ))}
          </Row>
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
