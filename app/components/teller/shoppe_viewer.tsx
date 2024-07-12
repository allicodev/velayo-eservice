import React, { useState } from "react";
import { Button, message, Modal, Typography } from "antd";
import { CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import PrinterService from "@/provider/printer.service";
import { useUserStore } from "@/provider/context";

interface MyProps {
  open: boolean;
  close: () => void;
  data: any;
}

const ShoppeView = ({ open, close, data }: MyProps) => {
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [to, setTo] = useState<NodeJS.Timeout>();

  const { printerIsAlive } = useUserStore();

  const handlePrint = () => {
    if (printerIsAlive) {
      (async (_) => {
        let res = await _.printShoppeCollect({
          name: data.name,
          parcelNum: data.pins.length,
          collectionPins: data.pins,
        });

        if (res.data?.success) message.success(res.data?.message ?? "Success");
      })(PrinterService);
    } else {
      message.warning("Printer is offline");
    }
  };

  return (
    <Modal
      open={open}
      closable={false}
      footer={[
        <Button size="large" type="primary" onClick={handlePrint}>
          Print
        </Button>,
        <Button size="large">Finish</Button>,
      ]}
      onCancel={close}
      title={
        <Typography.Title level={1} style={{ textAlign: "center" }}>
          Shoppe Collect
        </Typography.Title>
      }
    >
      <Typography.Title level={3}>Name: {data?.name}</Typography.Title>
      {data?.pins && data.pins.length > 0 && (
        <div style={{ display: "inline-block" }}>
          {data.pins.map((e: any, i: number) => (
            <div
              style={{ cursor: "pointer" }}
              key={`pin-${i + 1}`}
              onClick={() => {
                setCopiedIndex(i);
                clearTimeout(to);
                setTo(setTimeout(() => setCopiedIndex(-1), 2500));

                navigator.clipboard
                  .writeText(e)
                  .then((e) => message.success("Copied Successfully"));
              }}
            >
              <Typography.Text
                style={{
                  fontSize: "1.5em",
                  width: 110,
                  display: "inline-block",
                }}
              >
                PIN: {e}
              </Typography.Text>
              <Button
                icon={
                  copiedIndex == i ? (
                    <CheckCircleOutlined
                      style={{
                        color: "#fff",
                      }}
                    />
                  ) : (
                    <CopyOutlined
                      style={{
                        color: "#fff",
                      }}
                    />
                  )
                }
                size="small"
                style={{
                  backgroundColor: "#1777FF",
                  color: "#fff",
                  borderRadius: 4,
                }}
              >
                {copiedIndex == i ? "Copied" : ""}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ShoppeView;
