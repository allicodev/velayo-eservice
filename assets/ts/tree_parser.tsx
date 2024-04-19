import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { Items } from "@/types";
import React from "react";

export interface TreeNode {
  parentId: string;
  title: JSX.Element;
  rawTitle: string;
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
  onClick: (str: string) => void,
  searchValue: string
): TreeNode[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item, index) =>
      convertToTreeNode(item, index, [], onClick, searchValue)
    );
}

export function convertToTreeNode(
  item: Items,
  index: number,
  parentKeys: string[] = [],
  onClick: (str: string) => void,
  searchValue: string
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
        alignItems: "center",
        width: "100%",
      }}
    >
      <span style={{ marginRight: 10, fontSize: "1.8em" }}>{item.name}</span>
      <Button
        size="large"
        onClick={onClickNewSubCategory}
        icon={<PlusOutlined />}
      />
    </div>
  );
  const rawTitle = item.name;
  const className = "tree-title";
  const key =
    parentKeys.length > 0 ? `${parentKeys.join("-")}-${index}` : `${index}`;
  const children: TreeNode[] = item.sub_categories
    ? item.sub_categories.map((subItem, i) =>
        convertToTreeNode(
          subItem,
          i,
          [...parentKeys, String(index)],
          onClick,
          searchValue
        )
      )
    : [];
  const isLeaf = !item.sub_categories || item.sub_categories.length === 0;

  return {
    parentId: item._id,
    title,
    rawTitle,
    className,
    key,
    children,
    isLeaf,
  };
}

export function findItemNameByKey(
  tree: TreeNode[],
  key: string
): string | null {
  function searchNode(nodes: TreeNode[]): string | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node.rawTitle;
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

// TODO: flatten a tree node
export function mergeTreeNodes(nodes: TreeNode[]): TreeNode[] {
  let _nodes: TreeNode[] = [];

  nodes.forEach((e) => {
    if (e.children.length > 0) {
      _nodes = _nodes.concat(mergeTreeNodes(e.children));
    } else {
      _nodes.push(e);
    }
  });

  return _nodes;
}

export function findAllIndicesOfSubstring(
  mainString: string,
  subString: string
) {
  if (subString == "" || subString == null) return [];
  let indices = [];
  let index = -1;
  while ((index = mainString.indexOf(subString, index + 1)) !== -1) {
    indices.push(index, index + subString.length - 1);
  }
  return indices;
}
