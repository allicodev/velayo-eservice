import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Dropdown, Popconfirm, Tooltip, Typography, Modal } from "antd";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";

import { UserBadgeProps } from "@/types";
import Cookies from "js-cookie";

const UserBadge = ({ name, style, title }: UserBadgeProps) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    const currentSeconds = dayjs().second();
    setTimeout(
      () => setInterval(() => setCurrentTime(dayjs()), 1000 * 60),
      (60 - currentSeconds) * 1000
    );
  }, []);

  return (
    <>
      <div style={style}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text
            style={{ fontSize: 45, display: "block", lineHeight: 0.6 }}
          >
            Welcome {title} {name}
          </Typography.Text>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: (
                    <Tooltip title="Logout">
                      {/* <Popconfirm
                      title="Are you sure you want to logout?"
                      okText="LOGOUT"
                      okType="danger"
                      onConfirm={() => {
                        Cookies.remove("token");
                        window.location.reload();
                      }}
                    > */}
                      <div
                        onClick={() =>
                          modal.confirm({
                            icon: null,
                            title: "Logout Confirmation",
                            content: "Are you sure you want to logout ?",
                            okText: "LOGOUT",
                            okButtonProps: {
                              type: "primary",
                              danger: true,
                            },
                            onOk: () => {
                              Cookies.remove("token");
                              window.location.reload();
                            },
                          })
                        }
                      >
                        <LogoutOutlined style={{ color: "#f00" }} />{" "}
                        <span style={{ color: "#f00" }}>Logout</span>
                      </div>
                      {/* </Popconfirm> */}
                    </Tooltip>
                  ),
                },
              ],
            }}
          >
            <Button
              icon={<SettingOutlined />}
              size="large"
              ghost
              type="primary"
            />
          </Dropdown>
        </div>

        <Typography.Text style={{ fontSize: 26 }}>
          {currentTime.format("MMMM DD, YYYY - hh:mma")}
        </Typography.Text>
      </div>
      {contextHolder}
    </>
  );
};

export { UserBadge };
