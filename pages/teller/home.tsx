import React, { useState } from "react";
import { Col, Row } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { MdOutlineSendToMobile } from "react-icons/md";
import { FaMoneyBills } from "react-icons/fa6";
import { AiOutlineFileDone } from "react-icons/ai";

import { UserBadge, DashboardBtn } from "@/app/components";
import {
  GcashForm,
  TransactionHistory,
  TransactionDetails,
} from "@/app/components/teller";

import { useUserStore } from "@/provider/context";

const Teller = () => {
  const [openedMenu, setOpenedMenu] = useState("");
  const [transactionDetailsOpt, setTransactionOpt] = useState({
    open: false,
    transaction: null,
  });

  const { currentUser } = useUserStore();

  const menu = [
    {
      title: "Bills \nPayment",
      icon: <FaMoneyBills style={{ fontSize: 80 }} />,
      onPress: () => {},
    },
    {
      title: "Wallet Cash \nIn/out",
      icon: <WalletOutlined style={{ fontSize: 80 }} />,
      onPress: () => setOpenedMenu("gcash"),
    },
    {
      title: "E-Load",
      icon: <MdOutlineSendToMobile style={{ fontSize: 80 }} />,
      onPress: () => {},
    },
    {
      title: "Shopee Self \nCollect",
      onPress: () => {},
    },
    {
      title: "Transaction History",
      icon: <AiOutlineFileDone style={{ fontSize: 80 }} />,
      onPress: () => setOpenedMenu("th"),
    },
    { title: "miscellaneous", onPress: () => {} },
  ];

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
      <GcashForm open={openedMenu == "gcash"} close={() => setOpenedMenu("")} />
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
    </>
  );
};

export default Teller;
