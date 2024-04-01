import { POSButtonProps } from "@/types";
import React from "react";

const POSButtons = ({ label, value, icon, onClick }: POSButtonProps) => {
  return (
    <div
      onClick={() => onClick(value)}
      className="dashboard-btn"
      style={{
        background: "#D9D9D9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        cursor: "pointer",
        fontSize: "1.5em",
        borderRadius: 10,
      }}
    >
      {icon}
      {label}
    </div>
  );
};

export default POSButtons;
