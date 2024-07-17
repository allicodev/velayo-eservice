import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  Checkbox,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  TableProps,
  Tooltip,
} from "antd";
import { SearchOutlined, CheckOutlined, EyeOutlined } from "@ant-design/icons";
import EtcService from "@/provider/etc.service";
import { TransactionHistory } from "@/app/components/teller";
import { RequestQueue } from "@/types";
import PosHome from "../pos/pos";
import ShoppeView from "./shoppe_viewer";

interface MyProp {
  open: boolean;
  close: () => void;
  branchId: string;
}

const ModalQueue = ({ open, close, branchId }: MyProp) => {
  const [queueInput, setQueueInput] = useState<number | null>(null);
  const [requests, setRequests] = useState<RequestQueue[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [openPos, setOpenPos] = useState({ open: false, search: "" });
  const [openShoppe, setOpenShoppe] = useState<{
    open: boolean;
    data: Object | null;
  }>({
    open: false,
    data: null,
  });

  const refresh = () => setTrigger(trigger + 1);

  const columns: TableProps<RequestQueue>["columns"] = [
    { title: "Queue #", dataIndex: "queue", width: 90, align: "center" },
    {
      title: "Transaction Type",
      dataIndex: "billingType",
      align: "center",
      render: (_) => _?.toLocaleUpperCase() ?? "Queue",
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (_) => (
        <span
          style={{
            color:
              _ == "pending" ? "orange" : _ == "completed" ? "green" : "red",
          }}
        >
          {_.toLocaleUpperCase()}
        </span>
      ),
    },
    {
      title: "Functions",
      align: "center",
      dataIndex: "_id",
      render: (_, row, i) => (
        <Space size={8}>
          {row.status != "completed" &&
            (row.billingType == undefined ||
              row.billingType == "miscellaneous") && (
              <Tooltip title="Mark as Completed">
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  onClick={async () => {
                    let res = await EtcService.markCompleted(_);
                    if (res?.success ?? false) refresh();
                  }}
                />
              </Tooltip>
            )}
          {!["miscellaneous", undefined].includes(row.billingType) && (
            <Tooltip title="View">
              <Button
                icon={<EyeOutlined />}
                onClick={async () => {
                  if (row.billingType == "shopee") {
                    setOpenShoppe({ open: true, data: row.extra });
                    return;
                  }
                  await (TransactionHistory as any).openTransaction(
                    row.transactionId._id,
                    row?._id ?? null
                  );
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const searchTransaction = async () => {
    if (!queueInput) {
      message.warning("Cannot search. Input is empty.");
      return;
    }

    let res = await EtcService.getQueueRequest(branchId, queueInput);

    if (res?.success ?? (false && res?.data?.length != 0)) {
      setQueueInput(null);

      if (res?.data![0]?.billingType ?? false) {
        switch (res?.data![0].billingType) {
          case "bills":
          case "wallet":
          case "eload": {
            await (TransactionHistory as any).openTransaction(
              res?.data![0].transactionId._id
            );
            break;
          }
          case "miscellaneous": {
            setOpenPos({
              open: true,
              search: (res?.data![0].extra as any).selectedItem,
            });
            break;
          }
          case "shopee": {
            setOpenShoppe({ open: true, data: res?.data![0].extra ?? {} });
            break;
          }
        }
      } else {
        message.info("This queue has no active transaction");
        return;
      }

      close();
    }
  };
  useEffect(() => {
    setFetching(false);
    if (open)
      (async () => {
        let res = await EtcService.getQueueRequest(branchId);

        if (res?.success ?? false) {
          setFetching(false);
          setRequests(res.data ?? []);
        } else setFetching(false);
      })();
  }, [open, trigger]);

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          setQueueInput(null);
          close();
        }}
        footer={null}
        closable={false}
        width={600}
        style={{
          padding: 0,
        }}
        afterOpenChange={(open) => open && inputRef.current?.focus()}
        zIndex={1}
        destroyOnClose
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <InputNumber
            size="large"
            style={{
              fontSize: "1.25em",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              width: "100%",
            }}
            onChange={(e) => {
              if (e) setQueueInput(Number.parseInt(e!.toString()));
            }}
            onKeyUp={(e) => {
              if (Number.isNaN(parseInt((e.target as any).value)))
                setQueueInput(null);
            }}
            onPressEnter={searchTransaction}
            placeholder="Enter queue number..."
            controls={false}
            ref={inputRef}
            autoFocus
          />
          <Button
            size="large"
            icon={<SearchOutlined />}
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            onClick={searchTransaction}
          >
            search
          </Button>
        </div>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Checkbox
            style={{ marginRight: 10 }}
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            Show Completed
          </span>
        </div>
        <Table
          style={{ marginTop: 5 }}
          columns={columns}
          loading={fetching}
          rowKey={(e) => e._id ?? ""}
          dataSource={requests.filter((e) =>
            showCompleted ? true : e.status != "completed"
          )}
          scroll={{ y: "70vh" }}
          pagination={false}
        />
      </Modal>

      {/* context */}
      <PosHome
        open={openPos.open}
        search={openPos.search}
        close={() => setOpenPos({ open: false, search: "" })}
      />
      <ShoppeView
        open={openShoppe.open}
        close={() => setOpenShoppe({ open: false, data: null })}
        data={openShoppe.data}
      />
    </>
  );
};

export default ModalQueue;
