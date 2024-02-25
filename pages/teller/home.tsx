import React, { useState } from "react";
import { Col, Row } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { UserBadge, DashboardBtn } from "@/app/components";
import { GcashForm, TransactionHistory } from "@/app/components/teller";

const Teller = () => {
  const [openedMenu, setOpenedMenu] = useState("");

  const menu = [
    {
      title: "Bills Payment",
      icon: <UserOutlined style={{ fontSize: 80 }} />,
      onPress: () => {},
    },
    { title: "Wallet Cash In/out", onPress: () => setOpenedMenu("gcash") },
    { title: "E-Load", onPress: () => {} },
    {
      title: "Shopee Self Collect",
      icon: <UserOutlined style={{ fontSize: 80 }} />,
      onPress: () => {},
    },
    { title: "Transaction History", onPress: () => setOpenedMenu("th") },
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
            name="John Doe"
            title="Teller"
            style={{
              margin: 25,
            }}
          />
          <Row gutter={[32, 32]} style={{ padding: 20 }}>
            {menu.map((e) => (
              <Col span={8}>
                <DashboardBtn {...e} />
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
      />
    </>
  );
};

export default Teller;
