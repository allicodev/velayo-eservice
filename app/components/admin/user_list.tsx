import React, { useEffect, useState } from "react";
import {
  Drawer,
  Typography,
  TableProps,
  Space,
  Button,
  Table,
  Popconfirm,
  message,
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { DrawerBasicProps, ProtectedUser } from "@/types";
import NewUser from "./new_user";
import UserService from "@/provider/user.service";

const User = ({
  open,
  close,
  title,
  style,
  extra,
  onCellClick,
}: DrawerBasicProps) => {
  const [openedNewUser, setOpenedNewUser] = useState(false);
  const [users, setUsers] = useState<ProtectedUser[]>([]);
  const [trigger, setTrigger] = useState(0);

  const user = new UserService();

  const columns: TableProps<ProtectedUser>["columns"] = [
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
      dataIndex: "createdAt",
      render: (date) => dayjs(date).format("MMMM DD, YYYY"),
    },
    {
      title: "Actions",
      align: "center",
      dataIndex: "_id",
      render: (_) => (
        <Space>
          <Popconfirm
            title="Delete Confirmation"
            description="Are you sure to archive this user?"
            okText="Confirm"
            onConfirm={() => handeRemoveUser(_)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleNewUser = (obj: any) => {
    (async (_) => {
      let res = await _.newUser(obj);
      if (res.success) {
        message.success("Successfully Created");
        setTrigger(trigger + 1);
        setOpenedNewUser(false);
      } else message.warning(res.message);
    })(user);
  };

  const handeRemoveUser = (id: string) => {
    (async (_) => {
      let res = await _.deleteUser({ id });

      if (res.success) {
        message.success(res.message ?? "Deleted Successfully");
        setTrigger(trigger + 1);
      } else message.warning(res.message);
    })(user);
  };

  useEffect(() => {
    (async (_) => {
      let res = await _.getUsers({ page: 1, pageSize: 10 });

      if (res.success) {
        setUsers(res.data ?? []);
      }
    })(user);
  }, [trigger, open]);

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
            {title ?? "User List"}
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
          dataSource={users}
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
        onAdd={handleNewUser}
      />
    </>
  );
};

export default User;
