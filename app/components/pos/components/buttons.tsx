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
        paddingTop: 40,
        paddingBottom: 40,
        cursor: "pointer",
        fontSize: "1.5em",
        borderRadius: 10,
        maxHeight: 120,
        minHeight: 120,
      }}
    >
      {icon}
      {label}
    </div>
  );
};

export default POSButtons;
