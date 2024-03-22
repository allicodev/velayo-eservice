import React, { useState } from "react";
import { Col, Row } from "antd";

import { UserBadge, DashboardBtn } from "@/app/components";
import UserList from "@/app/components/admin/user_list";
import BillingSettings from "@/app/components/admin/billing_settings";
import EWalletSettings from "@/app/components/admin/ewallet_settings";
import Report from "@/app/components/admin/report";
import { useUserStore } from "@/provider/context";

const Home = () => {
  const [openedMenu, setOpenedMenu] = useState("");

  const { currentUser } = useUserStore();

  const menu = [
    { title: "Users", onPress: () => setOpenedMenu("user") },
    { title: "Bills", onPress: () => setOpenedMenu("bills") },
    { title: "E-Wallet", onPress: () => setOpenedMenu("wallet") },
    { title: "MISCELLANEOUS POS", onPress: () => {} },
    {
      title: "Report",
      onPress: () => setOpenedMenu("transaction"),
    },
    { title: "Receipt Format", onPress: () => {} },
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
              <Col span={8} key={`dahboard-btn-${i}`}>
                <DashboardBtn
                  {...e}
                  style={{
                    height: 150,
                  }}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* context */}
      <UserList
        open={openedMenu == "user"}
        close={() => setOpenedMenu("")}
        title="User List"
        style={{
          marginTop: 10,
        }}
      />
      <BillingSettings
        open={openedMenu == "bills"}
        close={() => setOpenedMenu("")}
      />
      <EWalletSettings
        open={openedMenu == "wallet"}
        close={() => setOpenedMenu("")}
      />
      <Report
        open={openedMenu == "transaction"}
        close={() => setOpenedMenu("")}
      />
    </>
  );
};

export default Home;
