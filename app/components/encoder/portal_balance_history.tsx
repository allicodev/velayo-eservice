import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  InputNumber,
  Modal,
  Table,
  TableProps,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import { Log, Portal } from "@/types";
import LogService from "@/provider/log.service";
import PortalService from "@/provider/portal.service";
import { useUserStore } from "@/provider/context";

const PortalBalanceHistory = ({
  open,
  close,
  portal,
}: {
  open: boolean;
  close: () => void;
  portal?: Portal | null;
}) => {
  const [itlog, setLogs] = useState<Log[]>([]);
  const [openRequest, setOpenRequest] = useState(false);
  const [balanceInput, setBalanceInput] = useState<number | null>(null);
  const [fetching, setFetching] = useState(false);

  const { currentUser } = useUserStore();

  const column2: TableProps<Log>["columns"] = [
    {
      title: "From",
      render: (_, row) =>
        row.userId.role == "admin" ? "Admin" : row.userId.name,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_) => (
        <Tag color={_ < 0 ? "red-inverse" : "green-inverse"}>
          ₱{" "}
          {_.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Tag>
      ),
    },
    {
      title: "Rebates",
      dataIndex: "rebate",
      render: (_) =>
        _ ? (
          <Tag color="green-inverse">
            ₱{" "}
            {_.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Tag>
        ) : (
          <Typography.Text type="secondary" italic>
            N/A
          </Typography.Text>
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      align: "center",
      render: (_) => dayjs(_).format("MMM DD, YYYY hh:mma"),
    },
  ];

  const getBalance = () => {
    (async (_) => {
      setFetching(true);
      let res = await _.getLog({
        type: "portal",
        portalId: portal?._id,
        page: 1,
        pageSize: 99999,
      });

      if (res?.success ?? false) setLogs(res?.data ?? []);
      setFetching(false);
    })(LogService);
  };

  const request = async () => {
    let res = await PortalService.requestBalance(
      balanceInput ?? 0,
      portal?._id ?? "",
      currentUser?._id ?? ""
    );

    if (res?.success ?? false) {
      setBalanceInput(null);
      message.success(res?.message ?? "Success");
      setOpenRequest(false);
    }
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
        width={600}
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
            {`${portal?.name.toLocaleUpperCase()} Balance`}
          </Typography.Title>
        }
        destroyOnClose
      >
        <Table
          columns={column2}
          dataSource={itlog}
          pagination={{
            size: "small",
          }}
          loading={fetching}
        />
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
          {`${portal?.name.toLocaleUpperCase()} Balance Request`}
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
            value={balanceInput}
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

export default PortalBalanceHistory;
