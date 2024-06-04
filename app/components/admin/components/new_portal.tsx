import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Flex, message } from "antd";
import { NewPortalProps, Portal } from "@/types";

const NewPortal = ({
  open,
  close,
  onAdd,
  portal,
}: {
  open: boolean;
  close: () => void;
  onAdd: (obj: NewPortalProps) => void;
  portal?: Portal | null;
}) => {
  const [portalName, setPortalName] = useState("");
  const [type, setType] = useState(["biller"]);

  useEffect(() => {
    if (portal && open) {
      setPortalName(portal.name);
      setType(portal.assignTo);
    }
  }, [portal, open]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setPortalName("");
        setType(["biller"]);
        close();
      }}
      footer={null}
      closable={false}
      title="New Portal"
      width={400}
    >
      <Flex gap={10} vertical>
        <Input
          size="large"
          value={portalName}
          onChange={(e) => setPortalName(e.target.value)}
        />
        <Select
          mode="multiple"
          size="large"
          value={type}
          onChange={setType}
          style={{
            display: "block",
          }}
          options={[
            {
              label: "Biller",
              value: "biller",
            },
            {
              label: "Wallet",
              value: "wallet",
            },
            {
              label: "E-Load",
              value: "eload",
            },
          ]}
        />
        <Button
          size="large"
          type="primary"
          onClick={() => {
            if (["", null, undefined].includes(portalName)) {
              message.error("Portal name is blank. Please provide.");
              return;
            }
            onAdd({ name: portalName, assignTo: type, _id: portal?._id });
            setPortalName("");
            setType(["biller"]);
          }}
          block
        >
          {portal ? "UPDATE" : "ADD"}
        </Button>
      </Flex>
    </Modal>
  );
};

export default NewPortal;
