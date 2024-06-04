import React, { useState } from "react";
import { Col, Row, Typography } from "antd";
import { AppstoreOutlined, HomeOutlined } from "@ant-design/icons";
import POSButtons from "@/app/components/pos/components/buttons";
import ItemsHome from "@/app/components/inventory/ItemsHome";

const POSSettings = () => {
  const [openMenu, setOpenMenu] = useState<{ key: string; extra: any }>({
    key: "",
    extra: null,
  });

  const items = [
    {
      label: "BACK TO HOME",
      value: "home",
      icon: (
        <HomeOutlined
          className="db-btn"
          style={{ fontSize: 50, color: "#000" }}
        />
      ),
    },
    {
      label: "Items",
      value: "items",
      icon: (
        <AppstoreOutlined
          className="db-btn"
          style={{ fontSize: 50, color: "#000" }}
        />
      ),
    },
  ];
  return (
    <div className="teller main-content">
      <div
        className="body-content"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography.Title level={2} style={{ margin: 20 }}>
            POS Settings and Configurations
          </Typography.Title>
        </div>
        <Row gutter={[16, 16]} style={{ marginLeft: 10, marginRight: 10 }}>
          {items.map((e, i) => (
            <Col key={`pos-btn-${i}`} span={3}>
              <POSButtons
                {...e}
                onClick={(e) => {
                  if (e == "home") window.location.href = "/";
                  setOpenMenu({ key: e, extra: null });
                }}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* context */}

      <ItemsHome
        open={openMenu.key == "items"}
        extraData={openMenu.extra}
        close={() => setOpenMenu({ key: "", extra: null })}
      />
    </div>
  );
};

export default POSSettings;
