import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";

import Report from "@/app/components/admin/report";
import BranchService from "@/provider/branch.service";
import UserList from "@/app/components/admin/user_list";
import Branch from "@/app/components/admin/components/branch";
import EWalletSettings from "@/app/components/admin/ewallet_settings";
import BillingSettings from "@/app/components/admin/billing_settings";

import { useItemStore, useUserStore } from "@/provider/context";
import { UserBadge, DashboardBtn } from "@/app/components";
import { BranchData, ItemData } from "@/types";
import { Pusher } from "@/provider/utils/pusher";
import ItemService from "@/provider/item.service";
import dayjs from "dayjs";

const Home = () => {
  const [openedMenu, setOpenedMenu] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [branches, setBranches] = useState<BranchData[]>([]);

  const { currentUser } = useUserStore();
  const { setItems, lastDateUpdated, setLastDateUpdated, items } =
    useItemStore();

  const branch = new BranchService();
  const item = new ItemService();

  const menu = [
    { title: "Users", onPress: () => setOpenedMenu("user") },
    { title: "Bills", onPress: () => setOpenedMenu("bills") },
    { title: "E-Wallet", onPress: () => setOpenedMenu("wallet") },
    {
      title: "POS",
      onPress: () => (window.location.href = "/pos/settings"),
    },
    {
      title: "Admin Tools",
      onPress: () => setOpenedMenu("transaction"),
    },
    { title: "Receipt Format", onPress: () => setOpenedMenu("branch") },
  ];

  const refresh = () => {
    alert("Admin is notified");
  };

  const initPusherProvider = () => {
    let channel = new Pusher().subscribe("admin");
    channel.bind("notify", refresh);

    return () => {
      channel.unsubscribe();
    };
  };

  useEffect(() => {
    const minutes = 5; // change this to update the items per (x) minutes
    (async (_) => {
      let res2 = await _.getBranch({});
      if (res2?.success ?? false) setBranches(res2?.data ?? []);
    })(branch);

    if (
      Math.abs(dayjs(lastDateUpdated).diff(dayjs(), "minutes")) >= minutes ||
      lastDateUpdated == null ||
      items.length == 0
    ) {
      (async (_) => {
        let res = await _.getItems();
        if (res?.success ?? false) {
          setItems((res?.data as ItemData[]) ?? []);
          setLastDateUpdated(dayjs());
          console.log("Items are refreshed");
        }
      })(item);
    }
  }, [trigger]);

  useEffect(() => {
    return initPusherProvider();
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
      <Branch
        open={openedMenu == "branch"}
        close={() => setOpenedMenu("")}
        branches={branches}
        refresh={() => setTrigger(trigger + 1)}
      />
    </>
  );
};

export default Home;

{
  /* <Typography.Text type="secondary" style={{ marginLeft: 10 }}>
{activeKey == "branch" ? "Manage Branch(es)" : ""}
</Typography.Text> */
}
