import React, { useEffect } from "react";
import { Button, Modal, Typography, message } from "antd";

import { LogBalance, Notification } from "@/types";
import dayjs from "dayjs";
import EtcService from "@/provider/etc.service";
import LogService from "@/provider/log.service";

const NotificationViewer = ({
  open,
  close,
  notif,
}: {
  open: boolean;
  close: () => void;
  notif: Notification | null;
}) => {
  const etc = new EtcService();
  const log = new LogService();

  const request = () => {
    (async (_, __) => {
      let res = await _.getLog({
        page: 1,
        pageSize: 9999,
        _id: notif?.extra?._id,
      });

      if (res?.success ?? false) {
        if (res.data && res.data.length > 0) {
          let l: LogBalance = res.data[0];
          let res2 = await __.newLog({
            type: "credit",
            amount: l.amount,
            userId: typeof l.userId == "object" ? l.userId._id : l.userId,
            balanceType: l.balanceType,
            status: "completed",
          });
          if (res2?.success ?? false) {
            message.success("Successfully Updated");
            close();
          } else message.error("Error in the Server");
        } else {
          message.error("Transaction Log not found or already deleted");
          return;
        }
      } else {
        message.error("Error in the Server");
        return;
      }
    })(log, log);
  };

  useEffect(() => {
    if (open)
      (async (_) => {
        await _.seenNotif(notif?._id ?? "");
      })(etc);
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      footer={null}
      zIndex={9999999}
      width={650}
      title={
        <Typography.Title level={3}>
          {dayjs(notif?.createdAt).format("MMMM DD, YYYY hh:mma")}{" "}
          <span style={{ fontSize: "0.65em" }}>
            ({dayjs(notif?.createdAt).fromNow()})
          </span>
        </Typography.Title>
      }
    >
      <br />
      <Typography.Text style={{ fontSize: "1.3em" }}>
        {notif?.description}
      </Typography.Text>

      <Button
        size="large"
        style={{ marginTop: 25 }}
        type="primary"
        onClick={request}
      >
        Confirm Request and Close
      </Button>
    </Modal>
  );
};

export default NotificationViewer;
