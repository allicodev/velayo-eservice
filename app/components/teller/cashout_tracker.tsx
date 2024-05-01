import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  TimePicker,
  Tooltip,
  Typography,
  message,
} from "antd";
import { COProps, TrackerOptions } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import EtcService from "@/provider/etc.service";
import TransactionHistory from "./transaction_history";

interface TrackerOptions2 extends TrackerOptions {
  day: Dayjs | null;
}

const COTracker = ({ open, close, setOpenedMenu }: COProps) => {
  const [trackerOpt, setTrackerOpt] = useState<TrackerOptions2>({
    day: dayjs(),
    time: null,
    code: null,
  });

  const etc = new EtcService();

  const handleSearch = () => {
    if (Object.values(trackerOpt).filter((e) => e == null).length > 0) {
      message.error("Some field are blank. Please Provide.");
      return;
    }

    (async (_) => {
      let traceId = `${trackerOpt.day?.format("DD")}${trackerOpt.time?.format(
        "HHmm"
      )}${trackerOpt.code}`;

      let res = await _.getTransactionFromTraceId(traceId);

      if (res?.success ?? false) {
        message.success(res?.message ?? "Found");
        new Promise<void>((resolve, reject) => {
          setOpenedMenu("th");
          resolve();
        }).then(async () => {
          await (TransactionHistory as any).openTransaction(res?.data?._id);
          close();
        });
      }
    })(etc);
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      closable={false}
      title={<Typography.Title level={3}>Cash Out Tracker</Typography.Title>}
      footer={null}
    >
      <div style={{ display: "flex", alignContent: "center" }}>
        <Tooltip title="Select Day">
          <DatePicker
            style={{
              width: 70,
            }}
            styles={{
              popup: {
                fontSize: "1.5em",
              },
            }}
            format={"DD"}
            defaultValue={dayjs()}
            onChange={(e) => setTrackerOpt({ ...trackerOpt, day: e })}
          />
        </Tooltip>
        <Tooltip title="Select Time">
          <TimePicker
            format="h:mm a"
            size="large"
            placeholder="Time"
            style={{
              height: 48,
              width: 100,
              marginLeft: 10,
            }}
            popupStyle={{
              fontSize: "1.5em",
            }}
            onChange={(e) => setTrackerOpt({ ...trackerOpt, time: e })}
            use12Hours
          />
        </Tooltip>
        <Tooltip title="4 Digit Reference Code">
          <Input
            style={{
              marginLeft: 10,
              width: 80,
              fontSize: "1.5em",
              textAlign: "center",
            }}
            placeholder="4 digit"
            minLength={4}
            maxLength={4}
            size="large"
            onChange={(e) =>
              setTrackerOpt({
                ...trackerOpt,
                code: e.target.value,
              })
            }
          />
        </Tooltip>
        <Button
          size="large"
          type="primary"
          style={{ marginLeft: 10, fontSize: "1.5em", height: 50, width: 150 }}
          onClick={handleSearch}
        >
          SEARCH
        </Button>
      </div>
    </Modal>
  );
};

export default COTracker;
