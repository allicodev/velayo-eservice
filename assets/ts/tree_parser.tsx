import { Items } from "@/types";

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
