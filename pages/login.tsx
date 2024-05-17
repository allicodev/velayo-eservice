import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Typography,
  message,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";

import { BranchData, UserLoginProps } from "@/types";
import UserService from "@/provider/user.service";
import { useUserStore, useAuthStore } from "@/provider/context";
import WebCamera from "@/app/components/teller/webcam";
import Webcam from "react-webcam";

const Login = () => {
  const [form] = Form.useForm();
  const user = new UserService();
  const { setUser, setBranch } = useUserStore();
  const { setAccessToken } = useAuthStore();

  const [openChoiceBranch, setOpenChoiceBranch] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);

  const [token, setToken] = useState("");

  const webcamRef = useRef<Webcam>(null);
  const [openWebcam, setOpenWebCam] = useState(false);

  const handleFinish = async (val: UserLoginProps) => {
    const response = await user.login(val);

    if (response.success) {
      if (response.data && response.data.role == "teller") {
        setUser(response.data);
        setToken(response.data!.token);
        new Promise(async (resolve) => {
          let res = await axios.get("/api/branch");
          if (res.data?.success ?? false) {
            setBranches(res.data?.data ?? []);
            resolve("success");
          }
        }).then(() => setOpenChoiceBranch(true));
      } else {
        message.success("Logged in successfully");
        setUser(response.data);
        setAccessToken(response.data!.token);
        Cookies.set("token", response.data!.token);
        window.location.reload();
      }
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
    <>
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
                {
                  required: true,
                  message: "Username is empty. Please Provide.",
                },
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
                {
                  required: true,
                  message: "Password is empty. Please Provide.",
                },
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
            <Button type="primary" size="large" htmlType="submit" block>
              Login
            </Button>
            <div style={{ textAlign: "center", marginTop: 15 }}>
              <Typography.Link
                style={{ fontSize: "1.25em" }}
                onClick={() => setOpenWebCam(true)}
              >
                TIME IN / TIME OUT
              </Typography.Link>
            </div>
          </Form>
        </Card>
      </div>

      {/* context */}
      <BranchChoicer
        open={openChoiceBranch}
        branches={branches}
        onSelectedBranch={(e) => {
          message.success("Logged in successfully");
          setBranch(e?._id ?? "");
          setAccessToken(token);
          Cookies.set("token", token);
          window.location.reload();
        }}
      />
      <WebCamera
        open={openWebcam}
        close={() => setOpenWebCam(false)}
        webcamRef={webcamRef}
      />
    </>
  );
};

const BranchChoicer = ({
  open,
  branches,
  onSelectedBranch,
}: {
  open: boolean;
  branches: BranchData[];
  onSelectedBranch: (obj: BranchData) => void;
}) => {
  return (
    <Modal
      footer={null}
      closable={false}
      open={open}
      title={<Typography.Title level={3}>Select a Branch</Typography.Title>}
      width={700}
      centered
    >
      <Row gutter={[16, 16]}>
        {branches.map((e, i) => (
          <Col key={`branch-btn-${i}`} span={8}>
            <BranchButton branch={e} onClick={onSelectedBranch} />
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

const BranchButton = ({
  branch,
  onClick,
}: {
  branch: BranchData;
  onClick: (obj: BranchData) => void;
}) => {
  const [onHover, setOnHover] = useState(false);
  return (
    <div
      style={{
        width: 200,
        height: 150,
        border: "1px solid #aaa",
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        cursor: "pointer",
        background: onHover ? "#d9d9d9" : "#fff",
      }}
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
      onClick={() => onClick(branch)}
    >
      <Typography.Text
        style={{
          fontSize: "1.7em",
        }}
        underline={onHover}
      >
        {branch.name}
      </Typography.Text>
      <Typography.Text
        style={{
          fontSize: "1.2em",
          textAlign: "center",
          textDecoration: onHover ? "underline" : "",
        }}
        type="secondary"
      >
        {branch.address}
      </Typography.Text>
    </div>
  );
};

export default Login;
