import React, { useEffect, useState } from "react";
import {
  Button,
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
  const item = new ItemService();
  const [form] = Form.useForm();

  const handleFinish = async (val: any) => {
    let a = await onSave({ ...val, isParent: false });

    if (a) {
      form.resetFields();
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
        form.resetFields();
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
          />
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
          label={<span style={{ fontSize: "1.6em" }}>Cost</span>}
          name="cost"
          style={{ margin: 0, marginBottom: 5 }}
          rules={[
            {
              required: true,
              message: "Cost is empty. Please Provide.",
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
          label={<span style={{ fontSize: "1.6em" }}>Price</span>}
          name="price"
          style={{ margin: 0, marginBottom: 5 }}
          rules={[
            {
              required: true,
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
      </Form>
    </Modal>
  );
};

export default NewItem;
