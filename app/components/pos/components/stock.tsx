import React, { useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  InputNumber,
  Modal,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";

import { AppDispatch, RootState } from "../state/store";
import {
  newItem,
  removeItem,
  updateQuantity,
  purgeItems,
} from "../state/counterSlice";
import { ItemData, StockProps } from "@/types";
import ItemService from "@/provider/item.service";

const Stock = ({ open, close, type, closeSelectedItem }: StockProps) => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [input, setInput] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const item = new ItemService();

  // * redux
  const selectedItem = useSelector((state: RootState) => state.item);
  const dispatch = useDispatch<AppDispatch>();

  const runTimer = (key: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(function () {
      searchItem(key);
    }, 500);
  };

  const searchItem = async (key: string) => {
    let res = await item.searchItem(key);
    if (res?.success ?? false) setItems(res?.data ?? []);
  };

  const handleSave = async () => {
    if (selectedItem.map((e) => e.quantity).some((e) => e == 0)) {
      message.warning(
        "Some of the Item has no quantity. Please provide or remove the Item."
      );
      return;
    }
    if (
      type == "stock-out" &&
      selectedItem
        .map((e) => e.quantity > e.currentQuantity)
        .some((e) => e == true)
    ) {
      message.warning(
        "Error Stock-Out. Stock-out quantity should be lower or equal to current quantity"
      );
      return;
    }

    Promise.all(
      selectedItem.map(
        (_item) =>
          new Promise(async (resolve, reject) => {
            let res = await item.updateItem(_item?._id ?? "", {
              quantity:
                (type == "stock-in" ? _item.quantity : -_item.quantity) +
                _item.currentQuantity,
            });

            if (res?.success ?? false) resolve("Success");
          })
      )
    ).then(() => {
      message.success("Successfully Added");
      dispatch(purgeItems());
      closeSelectedItem();
      close();
    });
  };

  return (
    <Modal
      title={
        <Typography.Title level={3}>
          STOCK UPDATE ({type.toLocaleUpperCase()})
        </Typography.Title>
      }
      open={open}
      onCancel={close}
      closable={false}
      width={900}
      footer={[
        <Button
          key="submit-btn"
          size="large"
          type="primary"
          style={{ height: 50, width: 120, fontSize: "1.8em" }}
          onClick={handleSave}
          disabled={selectedItem.length == 0}
        >
          SUBMIT
        </Button>,
      ]}
    >
      <AutoComplete
        className="stock-item-select"
        onChange={(_) => {
          setInput(_);
          if (_ != "") runTimer(_);
        }}
        value={input}
        style={{
          width: "100%",
          height: 60,
          marginBottom: 10,
        }}
        filterOption={(inputValue, option) =>
          option!
            .value!.toString()
            .toUpperCase()
            .indexOf(inputValue.toUpperCase()) !== -1
        }
        options={items.map((e) => ({
          label: e.name,
          value: e.name,
          key: e._id,
        }))}
        onSelect={(_, e) => {
          //* check if duplicated
          if (selectedItem.some((_) => _._id == e.key)) {
            message.warning("Item Already Added");
            return;
          } else {
            const _selectedItem = items.filter((_) => _._id == e.key)[0];
            const { _id, name, itemCode, unit, quantity, price, parentName } =
              _selectedItem;

            dispatch(
              newItem({
                _id,
                name,
                itemCode,
                unit: unit!,
                currentQuantity: quantity,
                quantity: 0,
                parentName: parentName?.split("-").reverse().join("-") ?? "",
                price,
              })
            );

            setInput("");
          }
        }}
        autoFocus
        allowClear
      />
      {selectedItem.length > 0 && (
        <Table
          columns={[
            {
              width: 1,
              render: (_: any, row: any) => (
                <Tooltip title="Remove Item">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeItem(row._id))}
                    danger
                  />
                </Tooltip>
              ),
            },
            { title: "Name", dataIndex: "name" },
            {
              title: "Item Code",
              dataIndex: "itemCode",
              align: "center",
              render: (_) => `${"00000".slice(_.toString().length)}${_}`,
            },
            { title: "Category", dataIndex: "parentName" },
            {
              title: "C. Price",
              width: 80,
              dataIndex: "price",
              render: (_) =>
                `₱${_?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
            },
            {
              title: "C. Quantity",
              width: 100,
              dataIndex: "currentQuantity",
              align: "center",
            },
            {
              title: `Stock(s) ${type == "stock-in" ? "In" : "Out"}`,
              align: "center",
              render: (_: any, row: any) => (
                <InputNumber
                  controls={false}
                  min={0}
                  size="large"
                  className="inputnum-align-end"
                  onChange={(e) =>
                    dispatch(updateQuantity({ id: row._id, quantity: e! }))
                  }
                />
              ),
            },
          ]}
          dataSource={selectedItem}
          locale={{ emptyText: " " }}
          rowKey={(e) => e._id}
          pagination={false}
        />
      )}
    </Modal>
  );
};

export default Stock;
