import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { Items } from "@/types";
import React from "react";

export interface TreeNode {
  title: JSX.Element;
  className: string;
  key: string;
  children: TreeNode[];
  isLeaf: boolean;
}

export function parseTree(
  items: Items[],
  parentId: string | null = null
): Items[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      sub_categories: parseTree(items, item._id),
    }));
}

export function buildTree(
  items: Items[],
  parentId: string | null = null,
  onClick: (str: string) => void
): TreeNode[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item, index) => convertToTreeNode(item, index, [], onClick));
}

export function convertToTreeNode(
  item: Items,
  index: number,
  parentKeys: string[] = [],
  onClick: (str: string) => void
): TreeNode {
  const onClickNewSubCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(item._id);
  };

  const title = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span style={{ marginRight: 10 }}>{item.name}</span>
      <Button
        size="small"
        onClick={onClickNewSubCategory}
        icon={<PlusOutlined />}
      />
    </div>
  );

  const className = "tree-title";
  const key =
    parentKeys.length > 0 ? `${parentKeys.join("-")}-${index}` : `${index}`;
  const children: TreeNode[] = item.sub_categories
    ? item.sub_categories.map((subItem, i) =>
        convertToTreeNode(subItem, i, [...parentKeys, String(index)], onClick)
      )
    : [];
  const isLeaf = !item.sub_categories || item.sub_categories.length === 0;

  return { title, className, key, children, isLeaf };
}

export function findItemNameByKey(
  tree: TreeNode[],
  key: string
): string | null {
  function searchNode(nodes: TreeNode[]): string | null {
    for (const node of nodes) {
      if (node.key === key) {
        return extractItemName(node.title);
      }
      if (node.children) {
        const name = searchNode(node.children);
        if (name !== null) {
          return name;
        }
      }
    }
    return null;
  }

  return searchNode(tree);
}

function extractItemName(title: JSX.Element): string | null {
  if (!React.isValidElement(title)) {
    return null;
  }
  const titleElement = title as React.ReactElement<any>;
  const { children } = titleElement.props;
  return (React.Children.toArray(children)[0] as any).props.children;
}
