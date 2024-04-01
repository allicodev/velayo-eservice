import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Row,
  Tree,
  Typography,
  message,
} from "antd";
import { DownOutlined } from "@ant-design/icons";

import { DrawerBasicProps, Items } from "@/types";
import NewParentItem from "./components/new-parent-item";
import ItemService from "@/provider/item.service";
import { parseTree, buildTree } from "@/assets/ts";

const ItemsHome = ({ open, close }: DrawerBasicProps) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [items, setItems] = useState<Items[]>([]);
  const [openNewParent, setOpenNewParent] = useState(false);

  // * utils
  const [_window, setWindow] = useState({ innerHeight: 0 });
  const item = new ItemService();

  const renderView1 = () => (
    <>
      <Input size="large" placeholder="Search an item..." allowClear />
      <div style={{ marginTop: 10 }}>
        <Tree.DirectoryTree
          multiple
          showLine
          className="no-leaf-icon"
          expandedKeys={expandedKeys}
          onExpand={(keys: React.Key[]) => {
            if (keys.length > 0) {
              setExpandedKeys([keys[keys.length - 1].toString()]);
            } else {
              setExpandedKeys([]);
            }
          }}
          rootStyle={{
            overflow: "scroll",
            height: "80vh",
          }}
          treeData={buildTree(parseTree(items, null), null)}
        />
      </div>
    </>
  );

  const handleNewParentItem = (str: string) => {
    (async (_) => {
      let res = await _.newParentItem(str);

      if (res.success) {
        message.success(res?.message ?? "Success");
        fetchItems();
      }
    })(item);
  };

  const fetchItems = () => {
    (async (_) => {
      let res = await _.getItems();
      console.log(res);
      if (res.success) {
        setItems(res?.data ?? []);
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
            onClick={() => setOpenNewParent(true)}
          >
            New
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>{renderView1()}</Col>
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
      <NewParentItem
        open={openNewParent}
        close={() => setOpenNewParent(false)}
        onSave={handleNewParentItem}
      />
    </>
  );
};

export default ItemsHome;
