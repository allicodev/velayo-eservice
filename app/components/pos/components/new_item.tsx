import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
} from "antd";

import { NewItemProps } from "@/types";
import ItemService from "@/provider/item.service";

const NewItem = ({ title, open, close, onSave }: NewItemProps) => {
  const [name, setName] = useState("");

  const [isParent, setIsParent] = useState(true);

  const item = new ItemService();
  const [form] = Form.useForm();

  const handleFinish = async (val: any) => {
    let a = await onSave({ ...val, isParent });

    if (a) {
      setName("");
      close();
    }
  };

  useEffect(() => {
    if (open)
      (async (_) => {
        let res = await _.getLastItemcode();
        if (res?.success ?? false)
          form.setFieldValue(
            "nevamaynd",
            `${"00000".slice(((res.data?.value ?? 0) + 1).toString().length)}${
              (res.data?.value ?? 0) + 1
            }`
          );
      })(item);
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setIsParent(true);
        close();
      }}
      width={600}
      footer={[
        <Button
          type="primary"
          size="large"
          key="confirm-btn"
          onClick={() => {
            form.submit();
          }}
          style={{
            fontSize: "1.8em",
            height: 50,
          }}
          block
        >
          CONFIRM
        </Button>,
      ]}
      title={<Typography.Title level={3}>{title}</Typography.Title>}
      closable={false}
      destroyOnClose
    >
      <Form
        labelAlign="left"
        colon={false}
        form={form}
        labelCol={{
          span: 5,
          style: {
            fontSize: "2em",
          },
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label={<span style={{ fontSize: "1.6em" }}>Item Code</span>}
          style={{ margin: 0, marginBottom: 5 }}
          name="nevamaynd"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input size="large" disabled />
        </Form.Item>
        <Form.Item
          label={<span style={{ fontSize: "1.6em" }}>Name</span>}
          name="name"
          style={{ margin: 0, marginBottom: 5 }}
          rules={[
            { required: true, message: "Name is empty. Please Provide." },
          ]}
        >
          <Input
            size="large"
            style={{
              letterSpacing: 0.5,
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <div
          style={{ float: "right", display: "flex", alignContent: "center" }}
        >
          <Checkbox
            className="customCheckbox"
            style={{ marginRight: 5 }}
            defaultChecked={isParent}
            onChange={(e) => setIsParent(e.target.checked)}
          />
          <label style={{ fontSize: "1.4em" }}>Is Parent?</label>
        </div>
        <br />
        <br />
        {!isParent && (
          <>
            <Form.Item
              label={<span style={{ fontSize: "1.6em" }}>Description</span>}
              name="description"
              style={{ margin: 0, marginBottom: 5 }}
              rules={[
                {
                  required: !isParent,
                  message: "Description is empty. Please Provide.",
                },
              ]}
            >
              <Input.TextArea autoSize={{ minRows: 2 }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontSize: "1.6em" }}>Unit</span>}
              name="unit"
              style={{ margin: 0, marginBottom: 5 }}
              initialValue={"pc(s)"}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                size="large"
                defaultValue={"pc(s)"}
                options={["pc(s)", "bot(s)", "kit(s)"].map((e) => ({
                  label: e.toLocaleUpperCase(),
                  value: e,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontSize: "1.6em" }}>Price</span>}
              name="price"
              style={{ margin: 0, marginBottom: 5 }}
              rules={[
                {
                  required: !isParent,
                  message: "Price is empty. Please Provide.",
                },
              ]}
            >
              <InputNumber
                size="large"
                className="align-end-input-num"
                min={0}
                style={{
                  width: 120,
                }}
                prefix="₱"
                controls={false}
                formatter={(value: any) =>
                  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontSize: "1.6em" }}>Quantity</span>}
              name="quantity"
              style={{ margin: 0, marginBottom: 5 }}
              rules={[
                {
                  required: !isParent,
                  message: "Quantity is empty. Please Provide.",
                },
              ]}
            >
              <InputNumber
                size="large"
                className="align-end-input-num"
                min={0}
                style={{
                  width: 120,
                }}
                controls={false}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default NewItem;
