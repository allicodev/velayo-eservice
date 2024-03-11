import React, { useState } from "react";
import { Button, Input, Modal, Select, message } from "antd";

import { NewUserProps, NewUser } from "@/types";
import { FloatLabel } from "@/assets/ts";

const NewUser = ({ open, close, onAdd }: NewUserProps) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formInput, setFormInput] = useState<NewUser>({
    name: "",
    email: "",
    username: "",
    role: "",
    password: "",
  });

  const validate = () => {
    if (Object.values(formInput).filter((e) => e == "").length > 0) {
      message.warning("There are blank field. Please Provide.");
      return;
    }

    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reg.test(formInput.email)) {
      message.warning("Email is invalid. Please provide a correct one.");
      return;
    }

    if (formInput.password == confirmPassword) onAdd(formInput);
    else
      message.error(
        "Password and Confirm Password didn't match. Please try again."
      );
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={400}
      destroyOnClose
    >
      <FloatLabel
        value={formInput.name}
        label="Name"
        style={{
          marginTop: 30,
        }}
      >
        <Input
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
          size="large"
        />
      </FloatLabel>
      <FloatLabel value={formInput.email} label="Email">
        <Input
          onChange={(e) =>
            setFormInput({ ...formInput, email: e.target.value })
          }
          size="large"
        />
      </FloatLabel>
      <FloatLabel value={formInput.username} label="Username">
        <Input
          onChange={(e) =>
            setFormInput({ ...formInput, username: e.target.value })
          }
          className="customInput"
          size="large"
        />
      </FloatLabel>
      <FloatLabel
        value={formInput.password}
        label="Password"
        labelClassName="custom-password-input"
      >
        <Input.Password
          onChange={(e) =>
            setFormInput({ ...formInput, password: e.target.value })
          }
          className="customInput"
          size="large"
        />
      </FloatLabel>
      <FloatLabel
        value={confirmPassword}
        label="Confirm Password"
        labelClassName="custom-password-input"
      >
        <Input.Password
          onChange={(e) => setConfirmPassword(e.target.value)}
          size="large"
        />
      </FloatLabel>
      <FloatLabel value={formInput.role} label="Role">
        <Select
          className="customInput"
          size="large"
          style={{
            width: 120,
          }}
          options={[
            {
              label: "Teller",
              value: "Teller",
            },
            {
              label: "Encoder",
              value: "Encoder",
            },
          ]}
          onChange={(e) => setFormInput({ ...formInput, role: e })}
        />
      </FloatLabel>
      <Button size="large" type="primary" onClick={validate} block>
        Register
      </Button>
    </Modal>
  );
};

export default NewUser;
