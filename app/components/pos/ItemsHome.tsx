import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Row,
  Space,
  Tooltip,
  Tree,
  TreeDataNode,
  Typography,
  message,
} from "antd";
import { DownOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

// TODO: remove white space, connect them into 1 or add smart search (smart via word and not a whole sentence)

import { DrawerBasicProps, Items } from "@/types";
import NewItem from "./components/new_item";
import ItemService from "@/provider/item.service";
import {
  parseTree,
  buildTree,
  TreeNode,
  findAllIndicesOfSubstring,
} from "@/assets/ts";

const ItemsHome = ({ open, close }: DrawerBasicProps) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [items, setItems] = useState<Items[]>([]);
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

  // * onclick utils variables
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);

  const getItemName = (id: string) => items.filter((e) => e._id == id)[0].name;

  const handleItemOnAddClick = (id: string) =>
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

          setTreeNodes(
            buildTree(
              parseTree(res.data, null),
              null,
              handleItemOnAddClick,
              searchValue
            )
          );
        }
      }
    })(item);
  };

  const highlightSearchItems = (search: string) => {
    let keys: React.Key[] = [];
    const nodeUpdater = (nodes: TreeNode[]): TreeNode[] => {
      const nodeUpdate = (_node: TreeNode): TreeNode => {
        const [startIndex, lastIndex] = findAllIndicesOfSubstring(
          _node.rawTitle.toLocaleLowerCase(),
          search.toLocaleLowerCase()
        );

        const title = (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            {startIndex > -1 ? (
              <div style={{ fontSize: "1.8em" }}>
                {startIndex != 0 ? (
                  <span>{_node.rawTitle.substring(0, startIndex)}</span>
                ) : null}
                <span style={{ color: "white", background: "red" }}>
                  {_node.rawTitle.substring(startIndex, lastIndex + 1)}
                </span>
                {!(lastIndex >= _node.rawTitle.length - 1) && (
                  <span>
                    {_node.rawTitle.slice(
                      -(_node.rawTitle.length - 1 - lastIndex)
                    )}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ marginRight: 10, fontSize: "1.8em" }}>
                {_node.rawTitle}
              </span>
            )}
            <Button
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleItemOnAddClick(_node.parentId!);
              }}
              icon={<PlusOutlined />}
            />
          </div>
        );

        if (startIndex > -1) {
          if (!keys.includes(_node.key)) {
            keys.push(_node.key);
          }
          setAutoExpandParent(true);
        } else {
          keys = keys.filter((e) => e != _node.key);
        }

        return { ..._node, title };
      };

      nodes.forEach((e, i) => {
        if (e.children.length > 0) nodes[i].children = nodeUpdater(e.children);
        nodes[i] = nodeUpdate(e);
      });
      return nodes;
    };
    setTreeNodes(nodeUpdater(treeNodes));
    setExpandedKeys(keys);
  };

  useEffect(() => {
    setWindow(window);
    fetchItems();
  }, []);

  return (
    <>
      <Drawer
        open={open}
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
          <Col span={8}>
            <div style={{ display: "flex" }}>
              <Input
                size="large"
                placeholder="Search an item..."
                value={searchValue}
                style={{
                  width: "90%",
                }}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  highlightSearchItems(e.target.value);
                  setSelectedKey(null);
                }}
                allowClear
              />
              <Tooltip title="Reset">
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    setSelectedKey(null);
                    setExpandedKeys([]);
                    setAutoExpandParent(false);
                    setSearchValue("");
                  }}
                />
              </Tooltip>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tree
                multiple
                showLine
                className="no-leaf-icon"
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={(keys: React.Key[]) => {
                  setExpandedKeys(keys.map((e) => e.toString()));
                  setAutoExpandParent(false);
                }}
                rootStyle={{
                  overflow: "scroll",
                  height: "80vh",
                }}
                onSelect={(_, f) => {
                  let e = f.node.key;
                  if (
                    expandedKeys
                      .map((e) => e.toString())
                      .filter((p) =>
                        new RegExp(`^${e}(-.*)?$`).test(p.toString())
                      ).length > 0
                  ) {
                    setExpandedKeys(
                      expandedKeys.filter(
                        (p) => !new RegExp(`^${e}(-.*)?$`).test(p.toString())
                      )
                    );
                    setSelectedKey(null);
                  } else {
                    setExpandedKeys([...expandedKeys, e]);
                    setSelectedKey(e);
                  }
                }}
                selectedKeys={[selectedKey ? selectedKey : ""]}
                treeData={treeNodes}
              />
            </div>
          </Col>
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
