import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Steps, Typography, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";

import { NewUserProps, NewUser } from "@/types";
import { FloatLabel } from "@/assets/ts";

const NewUser2 = ({ open, close, onAdd, onSave, user }: NewUserProps) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStop, setCurrentStep] = useState(0);
  const [formInput, setFormInput] = useState<NewUser>({
    name: "",
    email: "",
    username: "",
    role: "",
    employeeId: "",
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

    if (formInput.password == confirmPassword || user) {
      if (user) onSave(formInput);
      else onAdd(formInput);

      setFormInput({
        name: "",
        email: "",
        username: "",
        role: "",
        employeeId: "",
        password: "",
      });
      setCurrentStep(0);
      close();
    } else
      message.error(
        "Password and Confirm Password didn't match. Please try again."
      );
  };

  const footerSteps = () => {
    if (currentStop == 0)
      return (
        <Button
          type="primary"
          style={{
            height: 50,
            fontSize: "1.35em",
          }}
          onClick={() => {
            const { name, employeeId, role } = formInput;
            if (name == "" || employeeId == "" || role == "") {
              message.warning("Some fields are blank. Please provide.");
              return;
            }
            setCurrentStep(1);
          }}
          block
        >
          NEXT
        </Button>
      );
    else {
      return (
        <div
          style={{
            display: "flex",
            gap: 20,
          }}
        >
          <Button
            style={{
              height: 50,
              fontSize: "1.35em",
              flex: 1,
            }}
            onClick={() => setCurrentStep(0)}
            icon={<LeftOutlined />}
            block
          >
            PREV
          </Button>
          <Button
            type="primary"
            style={{
              height: 50,
              fontSize: "1.35em",
              flex: 3,
            }}
            onClick={validate}
            block
          >
            {user ? "UPDATE" : "CONFIRM"}
          </Button>
        </div>
      );
    }
  };

  useEffect(() => {
    if (user && open) setFormInput(user);
  }, [user, open]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setFormInput({
          name: "",
          email: "",
          username: "",
          role: "",
          employeeId: "",
          password: "",
        });
        setCurrentStep(0);
        close();
      }}
      footer={null}
      width={400}
      title={
        <Typography.Title level={3} style={{ margin: 0, textAlign: "center" }}>
          New User Registration Form
        </Typography.Title>
      }
      destroyOnClose
      closable={false}
    >
      <Steps
        current={currentStop}
        items={[
          {
            title: "Basic Information",
          },
          {
            title: "Credentials",
          },
        ]}
      />
      {currentStop == 0 && (
        <>
          <FloatLabel
            value={formInput.name}
            label="Name"
            style={{
              marginTop: 30,
              marginBottom: 20,
            }}
          >
            <Input
              onChange={(e) =>
                setFormInput({ ...formInput, name: e.target.value })
              }
              className="customInput size-50"
              value={formInput.name}
              style={{
                width: "100%",
                height: 50,
                fontSize: "1.5em",
              }}
            />
          </FloatLabel>
          <FloatLabel
            value={formInput.employeeId}
            label="Employee ID"
            style={{
              marginBottom: 20,
            }}
          >
            <Input
              onChange={(e) =>
                setFormInput({ ...formInput, employeeId: e.target.value })
              }
              className="customInput size-50"
              value={formInput.employeeId}
              style={{
                width: "100%",
                height: 50,
                fontSize: "1.5em",
              }}
            />
          </FloatLabel>
          <FloatLabel value={formInput.role} label="Role">
            <Input
              onChange={(e) =>
                setFormInput({ ...formInput, role: e.target.value })
              }
              className="customInput size-50"
              value={formInput.role}
              style={{
                width: "100%",
                height: 50,
                fontSize: "1.5em",
              }}
            />
          </FloatLabel>
        </>
      )}
      {currentStop == 1 && (
        <>
          <FloatLabel
            value={formInput.email}
            label="Email"
            style={{
              marginTop: 30,
              marginBottom: 20,
            }}
          >
            <Input
              onChange={(e) =>
                setFormInput({ ...formInput, email: e.target.value })
              }
              value={formInput.email}
              className="customInput size-50"
              style={{
                width: "100%",
                height: 50,
                fontSize: "1.5em",
              }}
            />
          </FloatLabel>
          <FloatLabel value={formInput.username} label="Username">
            <Input
              value={formInput.username}
              onChange={(e) =>
                setFormInput({ ...formInput, username: e.target.value })
              }
              className="customInput size-50"
              style={{
                width: "100%",
                height: 50,
                fontSize: "1.5em",
              }}
            />
          </FloatLabel>
          {!user && (
            <>
              <FloatLabel value={formInput.password} label="Password">
                <Input.Password
                  value={formInput.password}
                  onChange={(e) =>
                    setFormInput({ ...formInput, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: 50,
                    fontSize: "1.5em",
                  }}
                />
              </FloatLabel>
              <FloatLabel value={confirmPassword} label="Confirm Password">
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: 50,
                    fontSize: "1.5em",
                  }}
                />
              </FloatLabel>
            </>
          )}
        </>
      )}
      {footerSteps()}
    </Modal>
  );
};

export default NewUser2;
