import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Typography, message } from "antd";

import { FloatLabel } from "@/assets/ts";
import { BranchData } from "@/types";

const NewBranch = ({
  open,
  close,
  onSave,
  data,
}: {
  open: boolean;
  close: () => void;
  onSave: (str: string, obj: BranchData) => void;
  data?: BranchData | null;
}) => {
  const [input, setInput] = useState<BranchData>({
    name: "",
    address: "",
    device: "",
    spm: "",
  });

  const update = (key: string, value: string) =>
    setInput((e) => ({ ...e, [key]: value }));

  const validate = () => {
    let name = input.name;
    delete input.name;

    if (Object.values(input).filter((e) => ["", null].includes(e)).length > 0) {
      message.warning("Some fields are blank. Please provide.");
      return;
    }
    onSave(data ? "save" : "new", { ...input, name });
  };

  useEffect(() => {
    if (data) setInput(data);
  }, [data]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setInput({
          name: "",
          address: "",
          device: "",
          spm: "",
        });
        close();
      }}
      closable={false}
      footer={null}
      title={<Typography.Title level={3}>New Branch</Typography.Title>}
      destroyOnClose
    >
      <FloatLabel value={input.name} label="Name (Optional)">
        <Input
          size="large"
          value={input.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </FloatLabel>
      <FloatLabel value={input.address} label="Address">
        <Input
          size="large"
          value={input.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </FloatLabel>
      <FloatLabel label="Device" value={input.device}>
        <Input
          size="large"
          value={input.device}
          onChange={(e) => update("device", e.target.value)}
        />
      </FloatLabel>
      <FloatLabel label="SPM No." value={input.spm}>
        <Input
          size="large"
          value={input.spm}
          onChange={(e) => update("spm", e.target.value)}
        />
      </FloatLabel>
      <Button type="primary" size="large" onClick={validate} block>
        {data ? "UPDATE BRANCH" : "ADD NEW BRANCH"}
      </Button>
    </Modal>
  );
};

export default NewBranch;
