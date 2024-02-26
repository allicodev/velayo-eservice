import React, { useState } from "react";
import { Col, Row } from "antd";

import { UserBadge, DashboardBtn } from "@/app/components";
import UserList from "@/app/components/admin/user";

const Home = () => {
  const [openedMenu, setOpenedMenu] = useState("");

  const menu = [
    { title: "Users", onPress: () => setOpenedMenu("user") },
    { title: "Bills", onPress: () => {} },
    { title: "E-Wallet", onPress: () => {} },
    { title: "MISCELLANEOUS POS", onPress: () => {} },
    { title: "Transaction Report", onPress: () => {} },
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
            name="John Doe"
            title="Teller"
            style={{
              margin: 25,
            }}
          />
          <Row gutter={[32, 32]} style={{ padding: 20 }}>
            {menu.map((e) => (
              <Col span={8}>
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
    </>
  );
};

export default Home;
