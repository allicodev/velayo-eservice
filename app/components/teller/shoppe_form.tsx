import React, { useState } from "react";
import { Button, Input, InputNumber, Modal, Typography, message } from "antd";

import BillService from "@/provider/bill.service";
import PrinterService from "@/provider/printer.service";
import { useUserStore } from "@/provider/context";

interface Parcels {
  [key: string]: any;
}

const ShoppeForm = ({ open, close }: { open: boolean; close: () => void }) => {
  const [parcelNum, setParcelNum] = useState(0);
  const [amount, setAmount] = useState(0);
  const [name, setName] = useState("");
  const [pins, setPins] = useState<string[]>([]);

  const { currentUser, currentBranch } = useUserStore();

  const clearAll = () => {
    setParcelNum(0);
    setAmount(0);
    setName("");
    setPins([]);
  };

  const handleComplete = () => {
    if (name == "") {
      message.warning("Name is blank. Please Provide.");
      return;
    }
    if (pins.filter((e) => e.length < 6).length > 0) {
      message.warning("Some Collection Pin are invalid.");
      return;
    }
    let obj: Parcels = {
      name,
      number_of_parcel: parcelNum,
    };

    // assign pin collection
    pins.map((e, i) => {
      obj[`pin_collection_#${i + 1}`] = e;
    });

    obj.amount = `${amount == null ? 0 : amount}_money`;

    (async (_) => {
      let res = await _.requestShoppeCollect(
        JSON.stringify(obj),
        amount,
        currentUser?._id ?? "",
        currentBranch
      );

      if (res.success) {
        message.success("Transaction Completed");
        clearAll();
        close();
      }
    })(BillService);
  };

  const handlePrint = () => {
    if (name == "") {
      message.warning("Name is blank. Please Provide.");
      return;
    }
    if (pins.filter((e) => e.length < 6).length > 0) {
      message.warning("Some Collection Pin are invalid.");
      return;
    }

    (async (_) => {
      let res = await _.printShoppeCollect({
        name,
        parcelNum,
        collectionPins: pins,
      });

      if (res.data?.success) message.success(res.data?.message ?? "Success");
    })(PrinterService);
  };

  return (
    <Modal
      maskClosable={false}
      open={open}
      onCancel={() => {
        clearAll();
        close();
      }}
      title={
        <Typography.Title level={3}>Shoppe Self Collect Form</Typography.Title>
      }
      footer={[
        <Button
          size="large"
          key="print"
          disabled={parcelNum == 0 || parcelNum == null}
          onClick={handlePrint}
        >
          PRINT
        </Button>,
        <Button
          size="large"
          key="complete"
          type="primary"
          disabled={parcelNum == 0 || parcelNum == null}
          onClick={handleComplete}
        >
          COMPLETE
        </Button>,
      ]}
      destroyOnClose
    >
      <div>
        <label htmlFor="numberParcel" style={{ fontSize: "1.2rem" }}>
          Name
        </label>
        <Input
          id="name"
          style={{ width: "100%", paddingRight: 5 }}
          size="large"
          min={0}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: 10,
        }}
      >
        <div>
          <label htmlFor="numberParcel" style={{ fontSize: "1.2rem" }}>
            Number of Parcel:
          </label>
          <InputNumber
            id="numberParcel"
            style={{ width: "90%", paddingRight: 5 }}
            size="large"
            onChange={(e: any) => {
              setParcelNum(e);
              let a = Array(e).fill("");
              pins.forEach((value, index) => {
                if (index < a.length) {
                  a[index] = value;
                }
              });
              setPins(a);
            }}
            min={0}
          />
        </div>
        <div>
          <label htmlFor="Amount" style={{ fontSize: "1.2rem" }}>
            Amount:
          </label>
          <InputNumber
            id="numberParcel"
            prefix="₱"
            min={0}
            size="large"
            onChange={(e: any) => setAmount(e)}
            controls={false}
            style={{ paddingRight: 5, width: "90%" }}
            formatter={(value: any) =>
              value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </div>
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
              <label
                htmlFor="numberParcel"
                style={{ width: 130, fontSize: "1.1rem" }}
              >
                Collection Pin #{i + 1}:
              </label>
              <Input
                id="collectionPin"
                size="large"
                onChange={(e) => {
                  let _ = [...pins];
                  _[i] = e.target.value;

                  setPins(_);
                }}
                minLength={6}
                maxLength={6}
                onKeyDown={(e) => {
                  const charCode = e.which || e.keyCode;
                  if (charCode != 8 && charCode != 37 && charCode != 39) {
                    if (charCode < 48 || charCode > 57) {
                      e.preventDefault();
                    }
                  }
                }}
                style={{ paddingRight: 5, width: "15%" }}
              />
            </div>
          ))}
    </Modal>
  );
};

export default ShoppeForm;
