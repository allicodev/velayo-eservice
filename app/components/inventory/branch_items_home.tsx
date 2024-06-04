import React, { useState } from "react";
import {
  Drawer,
  Space,
  Typography,
  Button,
  Tooltip,
  Flex,
  message,
  Table,
  TableProps,
  Popconfirm,
} from "antd";
import {
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  HistoryOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { BranchData, BranchItem } from "@/types";
import NewItemBranch from "./components/new_item_branch";
import BranchService from "@/provider/branch.service";
import Stock from "./components/stock";
import StockHistory from "./components/stock_history";

// todo: fix stock in typo on current

interface BasicProps {
  open: boolean;
  close: () => void;
  branch: BranchData;
  updateBranch: (e: BranchData | undefined | null) => void;
}

const BranchItemHome = ({ open, close, branch, updateBranch }: BasicProps) => {
  const [openNewItem, setOpenNewItem] = useState(false);
  const [openHistory, setOpenHistory] = useState<{
    open: boolean;
    branchId: string | null | undefined;
  }>({ open: false, branchId: null });
  const [openStock, setOpenStock] = useState<{
    open: boolean;
    type: "stock-in" | "stock-out" | null;
  }>({ open: false, type: "stock-in" });

  //   etc and services
  const branchService = new BranchService();

  const drawerTitle = () => (
    <Flex align="center">
      <Typography.Title level={4} style={{ margin: 0 }}>
        Stock Inventory on {branch?.name}
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{ fontSize: "1.1em", marginLeft: 10 }}
      >
        ({branch?.address})
      </Typography.Text>
    </Flex>
  );

  const getExtra = () => (
    <Space key="extra-btns">
      <Tooltip title="STOCK IN">
        <Button
          size="large"
          icon={<VerticalAlignBottomOutlined />}
          type="primary"
          onClick={() => setOpenStock({ open: true, type: "stock-in" })}
        />
      </Tooltip>
      <Tooltip title="STOCK OUT">
        <Button
          size="large"
          icon={<VerticalAlignTopOutlined />}
          type="primary"
          onClick={() => setOpenStock({ open: true, type: "stock-out" })}
        />
      </Tooltip>
      <div
        style={{
          height: 20,
          width: 2,
          background: "#000",
          margin: 0,
          marginRight: 5,
          marginLeft: 5,
        }}
      />
      <Tooltip title="Stock History">
        <Button
          size="large"
          type="primary"
          icon={<HistoryOutlined />}
          onClick={() => setOpenHistory({ open: true, branchId: branch._id })}
        />
      </Tooltip>
      <Tooltip title="Add New Stock">
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenNewItem(true)}
        />
      </Tooltip>
    </Space>
  );

  const columns: TableProps<BranchItem>["columns"] = [
    {
      title: "Item Code",
      render: (_, row) =>
        `${"00000".slice(row?.itemId?.itemCode?.toString().length)}${
          row?.itemId?.itemCode
        }`,
    },
    {
      title: "Name",
      render: (_, row) => row?.itemId?.name,
    },
    {
      title: "Quantity",
      align: "center",
      width: 1,
      dataIndex: "stock_count",
    },
    {
      title: "Functions",

      width: 1,
      render: (_, row) => (
        <Space>
          <Popconfirm
            title="Delete Confirmation?"
            okText="DELETE"
            okButtonProps={{
              danger: true,
              size: "large",
              type: "primary",
            }}
            cancelButtonProps={{
              size: "large",
            }}
            onConfirm={() =>
              handleDeleteItem(row.itemId?._id ?? "", branch?._id ?? "")
            }
          >
            <Button
              icon={<DeleteOutlined />}
              size="large"
              type="primary"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleItemPushToBranch = async (ids: string[]) => {
    await branchService.newItemBranch(branch._id ?? "", ids).then((e) => {
      if (e.success ?? false) {
        updateBranch(e.data);
        message.success(e?.message ?? "Success");
      } else message.error(e?.message ?? "Error");
    });
  };

  const handleDeleteItem = async (itemId: string, branchId: string) => {
    let res = await branchService.removeBranchItem(branchId, itemId);

    if (res?.success ?? false) {
      message.success(res?.message ?? "Success");
      branch.items = branch.items
        ? branch?.items.filter((e) => e.itemId._id != itemId)
        : [];

      updateBranch(branch);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={close}
        width="100vw"
        title={drawerTitle()}
        extra={getExtra()}
      >
        <Table
          dataSource={branch?.items ?? []}
          columns={columns}
          rowKey={(e) => e.itemId?._id}
        />
      </Drawer>

      {/* context */}
      <NewItemBranch
        open={openNewItem}
        close={() => setOpenNewItem(false)}
        onAdd={handleItemPushToBranch}
        restrictId={branch?.items?.map((e) => e.itemId?._id)}
      />
      <Stock
        open={openStock.open}
        close={() => setOpenStock({ open: false, type: null })}
        type={openStock.type}
        branchId={branch?._id ?? ""}
        branchItems={branch?.items ?? []}
        onSubmit={updateBranch}
      />
      <StockHistory
        open={openHistory.open}
        close={() => setOpenHistory({ open: false, branchId: null })}
        branchId={openHistory.branchId ?? ""}
      />
    </>
  );
};

export default BranchItemHome;
