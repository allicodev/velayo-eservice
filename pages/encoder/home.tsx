import React from "react";

import { UserBadge } from "@/app/components";
import { Badge, Button, Space, Typography } from "antd";

const Encoder = () => {
  return (
    <>
      <div className="teller main-content">
        <div
          className="body-content"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <UserBadge
            name="John Doe"
            title="Encoder"
            style={{
              margin: 25,
            }}
          />

          <Typography.Text style={{ fontSize: 35, marginLeft: 25 }}>
            Pending Transactions
          </Typography.Text>
          <Space
            direction="vertical"
            style={{
              marginLeft: 25,
            }}
          >
            <Button
              style={{
                fontSize: 25,
                height: 50,
                width: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Branch 1: 001 <Badge count={1} />
            </Button>
            <Button
              style={{
                fontSize: 25,
                height: 50,
                width: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Branch 2: 007 <Badge count={7} />
            </Button>{" "}
            <Button
              style={{
                fontSize: 25,
                height: 50,
                width: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Branch 1: 002 <Badge count={1} />
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
};

export default Encoder;
