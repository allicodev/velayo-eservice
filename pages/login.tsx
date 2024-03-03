import React from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const Login = () => {
  const [form] = Form.useForm();
  return (
    <div className="login-container">
      <Card
        style={{
          width: 400,
        }}
        styles={{
          body: {
            paddingLeft: 35,
            paddingRight: 35,
            paddingTop: 20,
            paddingBottom: 10,
          },
        }}
        hoverable
      >
        <div
          style={{
            display: "flex",
            alignItems: "end",
          }}
        >
          <div>
            <UserOutlined
              style={{
                fontSize: 170,
                color: "#00000065",
              }}
            />
          </div>
          <div>
            <span
              style={{
                display: "block",
                fontSize: 50,
                lineHeight: 1,
                marginLeft: -5,
              }}
            >
              Velayo
            </span>
            <span
              style={{
                fontSize: 30,
                lineHeight: 1,
                letterSpacing: 3,
              }}
            >
              E-Services
            </span>
          </div>
        </div>
        <Form form={form}>
          <Form.Item name="username" noStyle>
            <Input
              size="large"
              className="customInput"
              prefix={<UserOutlined />}
              placeholder="Username"
              style={{
                marginBottom: 5,
              }}
            />
          </Form.Item>
          <Form.Item name="password" noStyle>
            <Input.Password
              size="large"
              className="customInput"
              prefix={<LockOutlined />}
              placeholder="Password"
              style={{
                marginBottom: 5,
              }}
            />
          </Form.Item>
          <Button type="primary" size="large" block>
            Login
          </Button>
          <div style={{ textAlign: "center" }}>
            Forget Password? <Typography.Link>Click Here</Typography.Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
