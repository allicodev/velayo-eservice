import React, { useState } from "react";
import { Button, Input, Modal, Typography } from "antd";

import { NewParentItemProps } from "@/types";

const NewParentItem = ({ open, close, onSave }: NewParentItemProps) => {
  const [name, setName] = useState("");

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={[
        <Button
          type="primary"
          size="large"
          key="confirm-btn"
          disabled={!(name.length != 0 && name != null)}
          onClick={() => {
            onSave(name);
            setName("");
            close();
          }}
        >
          CONFIRM
        </Button>,
      ]}
      title={<Typography.Title level={2}>New Item</Typography.Title>}
    >
      <Input
        size="large"
        style={{
          letterSpacing: 0.5,
        }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </Modal>
  );
};

export default NewParentItem;
