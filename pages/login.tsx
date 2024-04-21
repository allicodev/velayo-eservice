import React, { useEffect } from "react";
import { Button, Card, Form, Image, Input, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";

import { UserLoginProps } from "@/types";
import UserService from "@/provider/user.service";
import { useUserStore, useAuthStore } from "@/provider/context";

const Login = () => {
  const [form] = Form.useForm();
  const user = new UserService();
  const { setUser } = useUserStore();
  const { setAccessToken } = useAuthStore();

  const handleFinish = async (val: UserLoginProps) => {
    const response = await user.login(val);

    if (response.success) {
      message.success("Logged in successfully");
      setUser(response.data);
      setAccessToken(response.data!.token);
      Cookies.set("token", response.data!.token);
      window.location.reload();
    } else {
      message.error(response.message);
    }
  };

  // check if there is an admin, if none, create one
  useEffect(() => {
    (async (_) => {
      await axios.get("/api/user/init-credentials");
    })(axios);
  }, []);

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
            alignItems: "center",
          }}
        >
          <div>
            <Image
              src="/logo-1.png"
              preview={false}
              width={140}
              style={{
                margin: 10,
                border: "1px solid #eee",
                padding: 5,
                borderRadius: 10,
              }}
            />
          </div>
          <div
            style={{
              marginLeft: 20,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 50,
                lineHeight: 1,
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
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="username"
            style={{
              marginBottom: 0,
            }}
            rules={[
              { required: true, message: "Username is empty. Please Provide." },
            ]}
          >
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
          <Form.Item
            name="password"
            style={{
              marginBottom: 0,
            }}
            rules={[
              { required: true, message: "Password is empty. Please Provide." },
            ]}
          >
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
          <Button
            type="primary"
            size="large"
            loading={user.loaderHas("logging-in")}
            htmlType="submit"
            block
          >
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
