import React, { useState } from "react";

import { UserBadge } from "@/app/components";
import { Badge, Button, Select, Space, Typography } from "antd";
import { TransactionHistory, EncoderForm } from "@/app/components/teller";
import { BillsStateDataType } from "@/types";

const Encoder = () => {
  const [branchOpt, setBranchOpt] = useState({
    open: false,
    branch: "",
  });
  const [billsOption, setBillsOption] = useState<BillsStateDataType>({
    open: false,
    transaction: null,
  });

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
              onClick={() => setBranchOpt({ open: true, branch: "branch 1" })}
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
              onClick={() => setBranchOpt({ open: true, branch: "branch 2" })}
            >
              Branch 2: 007 <Badge count={7} />
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
              onClick={() => setBranchOpt({ open: true, branch: "branch 3" })}
            >
              Branch 3: 002 <Badge count={1} />
            </Button>
          </Space>
        </div>
      </div>
      {/* context */}
      <TransactionHistory
        open={branchOpt.open}
        title={branchOpt.branch}
        close={() => setBranchOpt({ open: false, branch: "" })}
        style={{
          width: "80vw",
        }}
        extra={
          <Select
            defaultValue={null}
            style={{
              width: 120,
            }}
            options={[
              { label: "All", value: null },
              { label: "PENDING", value: "pending" },
              { label: "COMPLETED", value: "completed" },
              { label: "FAILED", value: "failed" },
            ]}
          />
        }
        onCellClick={(e) => setBillsOption({ open: true, transaction: e })}
      />
      <EncoderForm
        close={() => setBillsOption({ open: false, transaction: null })}
        {...billsOption}
      />
    </>
  );
};

export default Encoder;
