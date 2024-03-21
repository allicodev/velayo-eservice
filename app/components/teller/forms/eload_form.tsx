import { FloatLabel } from "@/assets/ts";
import { Eload, EloadProps } from "@/types";
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";

// lodash
const _ = (__: any) => [null, undefined, ""].includes(__);

const Eload = ({ open, close, onSubmit }: EloadProps) => {
  const [eload, setEload] = useState<Eload>({
    provider: null,
    phone: null,
    amount: null,
    fee: null,
  });

  const update = (name: string, value: any) => {
    setEload({
      ...eload,
      [name]: value,
    });
  };

  const handleRequest = () => {
    // validate
    if (Object.values(eload).filter((e) => _(e) == true).length > 0) {
      message.warning("Some fields are blank. Please Provide.");
      return;
    }

    const reg = /^(09\d{9})|\+(\d{12})|^(639\d{9})$/;
    let number = eload?.phone;

    if (number) {
      if (/^09/.test(number) && number.length > 11) {
        message.warning("Number should have a maximum length of 11");
        return;
      } else if (/^\+639/.test(number) && number.length > 13) {
        message.warning("Number should have a maximum length of 12");
        return;
      } else if (/^639/.test(number) && number.length > 12) {
        message.warning("Number should have a maximum length of 12");
        return;
      } else if (reg.test(number) || number == "") {
      } else {
        message.warning(
          "Phone Number should be start in 09,+639 or 639, maximum of 11 digits."
        );
        return;
      }

      if (number.startsWith("+63")) {
        number = number.replaceAll("+63", "09");
      } else if (number.startsWith("63")) {
        number = number.replaceAll("63", "09");
      }

      (async () => {
        let a = await onSubmit({
          provider: eload.provider,
          phone: number,
          amount: eload.amount,
          fee: eload.fee,
        });
        console.log(a);
        if (a) {
          message.success("Successfully Requested");
          close();
        }
      })();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        close();
      }}
      title={<Typography.Title level={2}>E-Load</Typography.Title>}
      closable={false}
      footer={null}
      destroyOnClose
    >
      <FloatLabel bool={!_(eload.provider)} label="Provider">
        <Select
          className="customInput"
          size="large"
          style={{ display: "block" }}
          options={["TM", "GLOBE", "SMART", "TNT", "DITO"].map((e) => {
            return {
              label: e,
              value: e,
            };
          })}
          onChange={(e) => update("provider", e)}
        />
      </FloatLabel>
      <FloatLabel bool={!_(eload.phone)} label="Phone Number">
        <Input
          size="large"
          className="customInput"
          onChange={(e) => update("phone", e.target.value)}
        />
      </FloatLabel>
      <FloatLabel bool={!_(eload.amount)} label="Amount">
        <InputNumber
          size="large"
          className="customInput"
          style={{ width: "100%" }}
          prefix="₱"
          min={1}
          onChange={(e) => update("amount", e)}
          controls={false}
        />
      </FloatLabel>
      <FloatLabel bool={!_(eload.fee)} label="Fee">
        <InputNumber
          size="large"
          className="customInput"
          style={{ width: "100%" }}
          prefix="₱"
          min={1}
          onChange={(e) => update("fee", e)}
          controls={false}
        />
      </FloatLabel>
      <Button block size="large" type="primary" onClick={handleRequest}>
        REQUEST
      </Button>
    </Modal>
  );
};

export default Eload;
