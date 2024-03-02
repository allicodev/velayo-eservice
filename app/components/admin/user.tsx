import React, { useState } from "react";
import {
  Drawer,
  Typography,
  TableProps,
  Space,
  Button,
  Table,
  Popconfirm,
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { DrawerBasicProps, UserProps } from "@/types";
import NewUser from "./new_user";

const User = ({
  open,
  close,
  title,
  style,
  extra,
  onCellClick,
}: DrawerBasicProps) => {
  const [openedNewUser, setOpenedNewUser] = useState(false);

  const mock: UserProps[] = [
    {
      name: "Jhon Doe",
      username: "john_doe123",
      email: "mrjohn_doe@gmail.com",
      role: "Encoder",
      dateCreated: new Date(2024, 1, 22),
    },
    {
      name: "Angelina Jolie",
      username: "angeline143",
      email: "angelina_jolie@gmail.com",
      role: "Teller",
      dateCreated: new Date(2024, 1, 21),
    },
  ];

  const columns: TableProps<UserProps>["columns"] = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Username",
      key: "username",
      dataIndex: "username",
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
    },
    {
      title: "Role",
      key: "role",
      dataIndex: "role",
    },
    {
      title: "Date Created",
      key: "date_created",
      dataIndex: "dateCreated",
      render: (date) => dayjs(date).format("MMMM DD, YYYY"),
    },
    {
      title: "Actions",
      align: "center",
      dataIndex: "functions",
      render: (_) => (
        <Space>
          <Popconfirm
            title="Delete Confirmation"
            description="Are you sure to archive this user?"
            okText="Confirm"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        open={open}
        onClose={close}
        width="100%"
        height="100%"
        closeIcon={<DownOutlined />}
        extra={extra}
        placement="bottom"
        title={
          <Typography.Text style={{ fontSize: 25 }}>
            {title ?? "Transaction History"}
          </Typography.Text>
        }
        style={{
          borderTopLeftRadius: 25,
          borderBottomLeftRadius: 25,
          display: "flex",
          justifyContent: "center",
        }}
        rootStyle={{
          marginTop: 20,
          marginLeft: 20,
          marginBottom: 20,
        }}
      >
        <Button
          icon={<UserAddOutlined />}
          type="primary"
          size="large"
          onClick={(e) => setOpenedNewUser(true)}
        >
          New User
        </Button>
        <Table
          dataSource={mock}
          columns={columns}
          style={style}
          rowKey={(e) => e.username}
          onRow={(data) => {
            return {
              onClick: () => (onCellClick ? onCellClick(data) : null),
            };
          }}
        />
      </Drawer>
      {/* context */}

      <NewUser
        open={openedNewUser}
        close={() => setOpenedNewUser(false)}
        onAdd={(obj) => {
          console.log(obj);
        }}
      />
    </>
  );
};

export default User;
