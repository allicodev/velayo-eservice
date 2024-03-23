import { Input, InputNumber, Modal, Typography } from "antd";
import React, { useState } from "react";

const ShoppeForm = ({ open, close }: { open: boolean; close: () => void }) => {
  const [parcelNum, setParcelNum] = useState(0);
  return (
    <Modal
      maskClosable={false}
      open={open}
      onCancel={close}
      title={
        <Typography.Title level={3}>Shoppe Self Collect Form</Typography.Title>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: 10,
        }}
      >
        <label htmlFor="numberParcel">Number of Parcel:</label>
        <InputNumber
          id="numberParcel"
          style={{ width: "100%" }}
          onChange={(e: any) => setParcelNum(e)}
          controls={false}
          min={0}
        />
      </div>
      {parcelNum != 0 &&
        parcelNum != null &&
        Array(parcelNum)
          .fill(null)
          .map((e, i) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <label htmlFor="numberParcel" style={{ width: 120 }}>
                Collection Pin:
              </label>
              <Input
                id="numberParcel"
                onChange={(e) => {
                  const { value } = e.target;
                  const newValue = value.replace(/\D/g, "");
                  e.target.value = newValue;
                }}
              />
            </div>
          ))}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: 10,
        }}
      >
        <label htmlFor="numberParcel">Amount:</label>
        <InputNumber
          id="numberParcel"
          prefix="₱"
          min={0}
          //   onChange={(e: any) => setParcelNum(e)}
          controls={false}
        />
      </div>
    </Modal>
  );
};

export default ShoppeForm;
