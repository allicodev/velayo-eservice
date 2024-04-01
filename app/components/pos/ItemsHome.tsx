import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Row,
  Tree,
  TreeDataNode,
  Typography,
  message,
} from "antd";
import { DownOutlined } from "@ant-design/icons";

import { DrawerBasicProps, Items } from "@/types";
import NewItem from "./components/new_item";
import ItemService from "@/provider/item.service";
import { parseTree, buildTree, findItemNameByKey, TreeNode } from "@/assets/ts";

const ItemsHome = ({ open, close }: DrawerBasicProps) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [items, setItems] = useState<Items[]>([]);
  const [sortedItems, setSortedItems] = useState<Items[]>([]);
  const [openNewItem, setOpenNewItem] = useState({
    open: false,
    parentId: "",
  });

  // * for search feature
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);

  // * utils
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const item = new ItemService();

  const renderView1 = () => (
    <>
      <Input
        size="large"
        placeholder="Search an item..."
        // onChange={onSearchChange}
        allowClear
      />
      <div style={{ marginTop: 10 }}>
        <Tree.DirectoryTree
          multiple
          showLine
          className="no-leaf-icon"
          expandedKeys={expandedKeys}
          onExpand={(keys: React.Key[]) => {
            setExpandedKeys(keys.map((e) => e.toString()));
            setAutoExpandParent(false);
          }}
          rootStyle={{
            overflow: "scroll",
            height: "80vh",
          }}
          treeData={treeNodes}
        />
      </div>
    </>
  );

  const getItemName = (id: string) => items.filter((e) => e._id == id)[0].name;

  const handleItemOnclick = (id: string) =>
    setOpenNewItem({ open: true, parentId: id });

  const handleNewParentItem = (str: string) => {
    (async (_) => {
      let res = await _.newItem(
        str,
        openNewItem.parentId != "" ? openNewItem.parentId : undefined
      );

      if (res.success) {
        message.success(res?.message ?? "Success");
        fetchItems();
      }
    })(item);
  };

  const fetchItems = () => {
    (async (_) => {
      let res = await _.getItems();
      if (res.success) {
        if (res?.data) {
          setItems(res?.data ?? []);
          setSortedItems(parseTree(res.data, null));
          setTreeNodes(
            buildTree(parseTree(res.data, null), null, handleItemOnclick)
          );
        }
      }
    })(item);
  };

  useEffect(() => {
    setWindow(window);
    fetchItems();
  }, []);

  return (
    <>
      <Drawer
        open={true}
        onClose={close}
        placement="bottom"
        width="100%"
        height="100%"
        closeIcon={<DownOutlined />}
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            ITEMS
          </Typography.Title>
        }
        styles={{
          body: {
            overflow: "hidden",
          },
        }}
        extra={[
          <Button
            key="new-category"
            type="primary"
            size="large"
            style={{
              fontWeight: "bolder",
            }}
            onClick={() => setOpenNewItem({ open: true, parentId: "" })}
          >
            New
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col>{renderView1()}</Col>
          <Col span={1}>
            <Divider
              type="vertical"
              style={{
                height: _window!.innerHeight - 100,
              }}
            />
          </Col>
          <Col span={11}></Col>
        </Row>
      </Drawer>

      {/* context */}
      <NewItem
        open={openNewItem.open}
        title={
          openNewItem.parentId != ""
            ? `New Category for Item ${getItemName(openNewItem.parentId)}`
            : "New Item/Category"
        }
        close={() => setOpenNewItem({ open: false, parentId: "" })}
        onSave={handleNewParentItem}
      />
    </>
  );
};

export default ItemsHome;
