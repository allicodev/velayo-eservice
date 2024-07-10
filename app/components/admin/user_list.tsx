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
  Tooltip,
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  UserAddOutlined,
  EditOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  DrawerBasicProps,
  ProtectedUser,
  NewUser as NewUserProp,
} from "@/types";
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
  const [openedUser, setOpenedUser] = useState<NewUserProp | null>(null);
  const [users, setUsers] = useState<ProtectedUser[]>([]);
  const [trigger, setTrigger] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const columns: TableProps<ProtectedUser>["columns"] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "employeeId",
    },
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
      render: (_) => _.toLocaleUpperCase(),
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
      render: (_, row) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              size="large"
              icon={<EditOutlined />}
              onClick={() => {
                let $ = row as any;
                delete $.__v;
                delete $.updatedAt;
                delete $.createdAt;
                delete $.password;

                setOpenedUser($);
                setOpenedNewUser(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Confirmation"
            description="Are you sure to archive this user?"
            okText="Confirm"
            onConfirm={() => handeRemoveUser(row?._id ?? "")}
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
    })(UserService);
  };

  const handleSaveUser = (obj: any) => {
    (async (_) => {
      let res = await _.updateUser(obj);
      if (res?.success ?? false) {
        message.success(res?.message ?? "Success");
        setTrigger(trigger + 1);
        setOpenedNewUser(false);
        setOpenedUser(null);
      } else message.warning(res.message);
    })(UserService);
  };

  const handeRemoveUser = (id: string) => {
    (async (_) => {
      let res = await _.deleteUser({ id });

      if (res.success) {
        message.success(res.message ?? "Deleted Successfully");
        setTrigger(trigger + 1);
      } else message.warning(res.message);
    })(UserService);
  };

  const getUsers = ({
    role,
    page,
    pageSize,
    updateUsers = true,
  }: {
    role?: string | null;
    page: number;
    pageSize?: number;
    updateUsers?: boolean;
  }): Promise<ProtectedUser[] | any | void> =>
    new Promise(async (resolve, reject) => {
      // setFetching(true);
      if (!pageSize) pageSize = 10;

      let res = await UserService.getUsers({
        role: role ? [role.toLocaleLowerCase()] : undefined,
        page,
        pageSize,
      });

      if (res?.success ?? false) {
        if (!updateUsers) {
          return resolve(res.data);
        }

        // setFetching(false);
        setUsers(res?.data ?? []);
        setTotal(res.meta?.total ?? 10);
        resolve(res.data);
      } else {
        // setFetching(false);
        reject();
      }
    });

  useEffect(() => {
    getUsers({ page: 1, pageSize: 10, role: selectedRole });
  }, [trigger, open, selectedRole]);

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
          scroll={{
            y: "58vh",
          }}
          onRow={(data) => {
            return {
              onClick: () => (onCellClick ? onCellClick(data) : null),
            };
          }}
          pagination={{
            defaultPageSize: 10,
            total,
            onChange: (page, pageSize) =>
              getUsers({
                page,
                pageSize,
                role: selectedRole,
              }),
          }}
        />
      </Drawer>

      {/* context */}
      <NewUser
        open={openedNewUser}
        close={() => {
          setOpenedNewUser(false);
          setOpenedUser(null);
        }}
        onAdd={handleNewUser}
        onSave={handleSaveUser}
        user={openedUser}
      />
    </>
  );
};

export default User;
