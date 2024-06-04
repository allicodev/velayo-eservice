import React, { useState } from "react";
import { AutoComplete, Button, Modal, Table, Tooltip, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { ItemData } from "@/types";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/app/state/store";
import { newItem, removeItem, purgeItems } from "@/app/state/itemSlice";
import { useItemStore } from "@/provider/context";

interface BasicProps {
  open: boolean;
  close: () => void;
  onAdd: (str: string[]) => void;
  restrictId: string[] | undefined;
}

const NewItemBranch = ({ open, close, onAdd, restrictId }: BasicProps) => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [searchWord, setSearchWord] = useState("");

  // etc and services
  const selectedItem = useSelector((state: RootState) => state.branchItem);
  const dispatch = useDispatch<AppDispatch>();

  //   store context
  const { items: lcItems } = useItemStore();

  const searchItem = (keyword?: string) => {
    setItems(
      lcItems.filter((e) =>
        e.name.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase() ?? "")
      )
    );
  };

  const handleItemPushToBranch = () => {
    onAdd(selectedItem.map((e) => e._id) as string[]);
    dispatch(purgeItems());
    close();
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={
        selectedItem.length > 0 ? (
          <Button
            size="large"
            type="primary"
            style={{ width: 100, fontSize: "1.3em", height: 40 }}
            onClick={handleItemPushToBranch}
          >
            ADD
          </Button>
        ) : null
      }
    >
      <AutoComplete
        size="large"
        style={{ width: "100%" }}
        value={searchWord}
        filterOption={(inputValue, option) =>
          option!
            .value!.toString()
            .toUpperCase()
            .indexOf(inputValue.toUpperCase()) !== -1
        }
        options={items
          // .filter((e) => selectedItem.map((_) => _._id).some((_) => _ == e._id)) // ! not working
          .map((e) => ({
            label: e.name,
            value: e.name,
            key: e._id,
          }))}
        onChange={(e) => {
          searchItem(e);
          setSearchWord(e);
        }}
        onSelect={(_, __) => {
          if (
            selectedItem.some((e) => e.name == __.label) ||
            restrictId?.includes(__.key)
          ) {
            message.warning("Already added");
          } else dispatch(newItem(lcItems.filter((e) => e._id == __.key)[0]));
          setSearchWord("");
        }}
      />

      {selectedItem.length > 0 && (
        <Table
          locale={{ emptyText: " " }}
          dataSource={selectedItem}
          pagination={false}
          rowKey={(e) => e.name}
          style={{ marginTop: 10 }}
          columns={[
            {
              title: "Item Code",
              dataIndex: "itemCode",
              width: 150,
              align: "center",
              render: (_) => `${"00000".slice(_.toString().length)}${_}`,
            },
            { title: "Name", dataIndex: "name", width: 300 },
            {
              title: "Price",
              width: 100,
              dataIndex: "price",
              render: (_) =>
                `₱${_?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
            },
            {
              width: 1,
              render: (_: any, row: any) => (
                <Tooltip title="Remove Item">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeItem(row.name))}
                    danger
                  />
                </Tooltip>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
};

export default NewItemBranch;
