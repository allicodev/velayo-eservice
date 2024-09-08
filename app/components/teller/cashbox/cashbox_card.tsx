import React from "react";
import { Card, Typography } from "antd";

import useCashBoxCard from "./cashbox_card.hooks";

const CashboxCard = () => {
  const { currentBalance } = useCashBoxCard();

  return (
    <Card
      style={{ border: "1px solid #d9d9d9", borderRadius: 8 }}
      styles={{
        body: {
          padding: 0,
        },
      }}
      hoverable
    >
      <div
        style={{
          background: "#d9d9d9",
          padding: 10,
        }}
      >
        <Typography.Title
          level={4}
          style={{
            fontFamily: "abel",
            margin: 0,
          }}
        >
          Disbursement Box
        </Typography.Title>
      </div>
      <div
        style={{
          padding: 10,
          fontSize: "1.5em",
          textAlign: "end",
        }}
      >
        ₱{" "}
        {currentBalance?.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
      </div>
    </Card>
  );
};

export default CashboxCard;
