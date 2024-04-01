import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { Items } from "@/types";

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
  parentId: string | null = null
): TreeNode[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item, index) => convertToTreeNode(item, index));
}

export function convertToTreeNode(
  item: Items,
  index: number,
  parentKeys: string[] = []
): TreeNode {
  const onClickNewSubCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const title = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{item.name}</span>
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
        convertToTreeNode(subItem, i, [...parentKeys, String(index)])
      )
    : [];
  const isLeaf = !item.sub_categories || item.sub_categories.length === 0;

  return { title, className, key, children, isLeaf };
}
