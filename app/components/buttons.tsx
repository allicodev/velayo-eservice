import React from "react";
import { DashboardBtnProps } from "@/types";
import { Typography } from "antd";

const DashboardBtn = ({ title, onPress, icon, style }: DashboardBtnProps) => {
  return (
    <div
      className="dashboard-btn"
      style={{
        background: "#D9D9D9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: 10,
        cursor: "pointer",
        ...style,
      }}
      onClick={onPress}
    >
      {icon}
      <Typography.Text style={{ fontSize: 38 }}>{title}</Typography.Text>
    </div>
  );
};

export { DashboardBtn };
