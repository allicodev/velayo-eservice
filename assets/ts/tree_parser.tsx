import { ItemData } from "@/types";

export interface TreeNode {
  id: string;
  isParent: boolean;
  parentId: string;
  title: JSX.Element;
  rawTitle: string;
  className: string;
  key: string;
  children: TreeNode[];
  isLeaf: boolean;
}

export function parseTree(
  items: ItemData[],
  parentId: string | null = null
): ItemData[] {
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

// * tree utils
export const parseKeyToTree = (nodes: TreeNode[], keys: string): string => {
  let _keys = keys.split("-");
  // _keys = [...new Set(_keys)];
  let selectedNode: TreeNode | null = nodes[parseInt(_keys[0])];
  let title = `${selectedNode.rawTitle} ${_keys.length > 2 ? " - " : ""}`;

  for (let i = 1; i < _keys.length - 1; i++) {
    selectedNode = selectedNode?.children[parseInt(_keys[i])];
    if (selectedNode) {
      title += selectedNode.rawTitle + (i == _keys.length - 2 ? "" : " - ");
    }
  }

  return title;
};

export const getNameById = (nodes: TreeNode[], id: string): string => {
  for (let i = 0; i < nodes.length; i++) {
    let e = nodes[i];
    if (e.id == id) {
      return e.rawTitle;
    } else {
      if (e.children.length > 0) return getNameById(e.children, id);
    }
  }
  return "";
};
