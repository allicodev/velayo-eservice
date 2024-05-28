import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  InputNumber,
  Modal,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import { LogBalance, User } from "@/types";
import LogService from "@/provider/log.service";
import { useUserStore } from "@/provider/context";
import dayjs from "dayjs";
import EtcService from "@/provider/etc.service";

const BalanceHistory = ({
  open,
  close,
  balanceType,
  user,
}: {
  open: boolean;
  close: () => void;
  balanceType: string;
  user: User | null;
}) => {
  const [openRequest, setOpenRequest] = useState(false);
  const [balanceInput, setBalanceInput] = useState(0);
  const [itlog, setLogs] = useState<LogBalance[]>([]);
  const [fetching, setFetching] = useState(false);

  const log = new LogService();
  const etc = new EtcService();

  const getBalance = () => {
    if (balanceType == "e-load") balanceType = "eload";
    if (balanceType == "biller") balanceType = "bills";

    (async (_) => {
      setFetching(true);
      let res = await _.getLog({
        page: 1,
        pageSize: 999999,
        type: ["credit", "debit"],
        balanceType,
        userId: user?._id ?? "",
      });

      if (res?.success ?? false) setLogs(res?.data ?? []);
      setFetching(false);
    })(log);
  };

  const request = () => {
    if (balanceType == "e-load") balanceType = "eload";
    if (balanceType == "biller") balanceType = "bills";

    (async (_, __) => {
      let res = await _.newLog({
        type: "credit",
        amount: balanceInput,
        userId: user?._id ?? "",
        balanceType,
        status: "pending",
      });

      if (res?.success ?? false) {
        let res2 = await __.newNotif({
          from: user?._id ?? "",
          description: `Encoder ${
            user?.name
          } requested a balance of ${balanceInput
            .toString()
            .replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ","
            )} (${balanceType.toLocaleUpperCase()})`,
          extra: {
            _id: res?.data?._id,
          },
        });

        if (res2?.success ?? false) {
          setBalanceInput(0);
          setOpenRequest(false);
          message.success("Successfully Requested");
        }
      } else message.error("Error in the Server");
    })(log, etc);
  };

  useEffect(() => {
    if (open) getBalance();
  }, [open]);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          setBalanceInput(0);
          close();
        }}
        width={400}
        extra={
          <Button
            type="primary"
            size="large"
            onClick={() => setOpenRequest(true)}
          >
            REQUEST
          </Button>
        }
        title={
          <Typography.Title level={3} style={{ margin: 0 }}>
            {`${balanceType.toLocaleUpperCase()} Balance`}
          </Typography.Title>
        }
        destroyOnClose
      >
        <Spin spinning={fetching}>
          <Timeline
            mode="left"
            items={itlog.map((e) => ({
              label: (
                <Typography.Text style={{ fontSize: "1.2em" }}>
                  {dayjs(e.createdAt).format("MM-DD-YY hh:mma")}
                </Typography.Text>
              ),
              children: (
                <Typography.Text
                  style={{
                    fontSize: "1.2em",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {e.type == "credit" && e.status == "completed"
                    ? "+"
                    : e.status == "pending"
                    ? ""
                    : "-"}{" "}
                  {e.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {e.status && (
                    <Tag
                      color={
                        e.status == "pending" ? "blue-inverse" : "green-inverse"
                      }
                    >
                      {e.status.toLocaleUpperCase()}
                    </Tag>
                  )}
                </Typography.Text>
              ),
            }))}
          />
        </Spin>
      </Drawer>

      {/* context */}
      <Modal
        open={openRequest}
        closable={false}
        footer={null}
        onCancel={() => setOpenRequest(false)}
        styles={{
          content: {
            width: 350,
          },
        }}
        destroyOnClose
      >
        <Typography.Title level={3}>
          {`${balanceType.toLocaleUpperCase()} Balance Request`}
        </Typography.Title>
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <InputNumber
            size="large"
            min={0}
            controls={false}
            formatter={(value: any) =>
              value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
            style={{
              width: "100%",
            }}
            onChange={(e) => setBalanceInput(e)}
          />
          <Button
            type="primary"
            size="large"
            disabled={balanceInput == 0 || balanceInput == null}
            onClick={request}
          >
            Request
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default BalanceHistory;
