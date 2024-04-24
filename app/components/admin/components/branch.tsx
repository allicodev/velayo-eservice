import React from "react";
import { Button, Space, Tabs, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import type { BranchData } from "@/types";

const Branch = ({
  branches,
  openEdit,
}: {
  branches: BranchData[];
  openEdit: (obj: BranchData) => void;
}) => {
  return (
    <Tabs
      tabPosition="left"
      items={branches.map((_, i) => {
        const id = String(i + 1);
        return {
          label: `Branch ${id}`,
          key: id,
          children: (
            <Space direction="vertical">
              <div>
                <label
                  htmlFor="address"
                  style={{
                    display: "inline-block",
                    width: 100,
                    fontSize: "1.5em",
                  }}
                >
                  Name:{" "}
                </label>
                <Typography.Text id="address" style={{ fontSize: "1.5em" }}>
                  {_.name}
                </Typography.Text>
              </div>
              <div>
                <label
                  htmlFor="address"
                  style={{
                    display: "inline-block",
                    width: 100,
                    fontSize: "1.5em",
                  }}
                >
                  Address:{" "}
                </label>
                <Typography.Text id="address" style={{ fontSize: "1.5em" }}>
                  {_.address}
                </Typography.Text>
              </div>
              <div>
                <label
                  htmlFor="address"
                  style={{
                    display: "inline-block",
                    width: 100,
                    fontSize: "1.5em",
                  }}
                >
                  Device:{" "}
                </label>
                <Typography.Text
                  id="device"
                  style={{
                    fontSize: "1.5em",
                  }}
                >
                  {_.device}
                </Typography.Text>
              </div>
              <div>
                <label
                  htmlFor="spm"
                  style={{
                    display: "inline-block",
                    width: 100,
                    fontSize: "1.5em",
                  }}
                >
                  SPM No. :{" "}
                </label>
                <Typography.Text
                  id="spm"
                  style={{
                    fontSize: "1.5em",
                  }}
                >
                  {_.spm}
                </Typography.Text>
              </div>
              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={() => openEdit(_)}
              >
                EDIT
              </Button>
            </Space>
          ),
        };
      })}
    />
  );
};

export default Branch;
