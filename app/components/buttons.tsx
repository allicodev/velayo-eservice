import React, { ReactNode } from "react";
import { DashboardBtnProps } from "@/types";
import { Typography } from "antd";

const DashboardBtn = ({ title, onPress, icon, style }: DashboardBtnProps) => {
  const formatString = (str: string): ReactNode => {
    const _str = str.split("\n");
    return (
      <>
        {_str.map((e, i) => (
          <React.Fragment key={`title-key-${i}`}>
            {e}
            <br />
          </React.Fragment>
        ))}
      </>
    );
  };
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
      <Typography.Text style={{ fontSize: 38, textAlign: "center" }}>
        {formatString(title)}
      </Typography.Text>
    </div>
  );
};

export { DashboardBtn };
