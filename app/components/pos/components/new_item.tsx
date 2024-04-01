import React, { useState } from "react";
import { Button, Input, Modal, Typography } from "antd";

import { NewItemProps } from "@/types";

const NewItem = ({ title, open, close, parentId, onSave }: NewItemProps) => {
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
      title={<Typography.Title level={3}>{title}</Typography.Title>}
    >
      <Input
        size="large"
        placeholder="Item name..."
        style={{
          letterSpacing: 0.5,
        }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </Modal>
  );
};

export default NewItem;
