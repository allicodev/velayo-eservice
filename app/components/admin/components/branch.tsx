import React, { useState } from "react";
import { Button, Drawer, Space, Tabs, Typography, message } from "antd";
import { EditOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";

import type { Branch, BranchData } from "@/types";
import NewBranch from "./new_branch";
import BranchService from "@/provider/branch.service";

interface OpenBranch {
  open: boolean;
  data: BranchData | null;
}

const Branch = ({
  open,
  close,
  branches,
  refresh,
}: {
  open: boolean;
  close: () => void;
  branches: BranchData[];
  refresh: () => void;
}) => {
  const [openNewBranch, setOpenNewBranch] = useState<OpenBranch>({
    open: false,
    data: null,
  });

  const handleNewBranch = (mode: string, obj: Branch | BranchData) => {
    (async (_) => {
      let res;
      if (mode == "new") res = await _.newBranch(obj as any);
      else res = await _.updateBranch(obj as BranchData);

      if (res?.success ?? false) {
        message.success(res?.message ?? "Success");
        refresh();
        setOpenNewBranch({ open: false, data: null });
      }
    })(BranchService);
  };

  const handleOpenEdit = (obj: BranchData) => {
    setOpenNewBranch({ open: true, data: obj });
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      placement="bottom"
      height="100%"
      width="100%"
      closeIcon={<DownOutlined />}
      title="Receipt Format"
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      extra={
        <Button
          type="primary"
          onClick={() => setOpenNewBranch({ open: true, data: null })}
          size="large"
          icon={<PlusOutlined />}
        >
          NEW BRANCH
        </Button>
      }
    >
      <Tabs
        tabPosition="left"
        style={{
          height: "100%",
        }}
        items={branches.map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Branch ${id}`,
            key: id,
            children: (
              <Space direction="vertical" style={{ padding: 20 }}>
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
                  onClick={() => handleOpenEdit(_)}
                >
                  EDIT
                </Button>
              </Space>
            ),
          };
        })}
      />

      {/* context */}
      <NewBranch
        open={openNewBranch.open}
        close={() => setOpenNewBranch({ open: false, data: null })}
        onSave={handleNewBranch}
        data={openNewBranch.data}
      />
    </Drawer>
  );
};

export default Branch;
