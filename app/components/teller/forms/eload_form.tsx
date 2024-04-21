import { FloatLabel } from "@/assets/ts";
import type { Eload, EloadProps } from "@/types";
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Radio,
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
    type: "regular",
    promo: null,
  });

  const update = (name: string, value: any) => {
    setEload({
      ...eload,
      [name]: value,
    });
  };

  const handleRequest = () => {
    // validate
    let _$ = eload;

    if (_$.type == "regular") delete _$.promo;
    else _$.promo = eload.promo;

    if (Object.values(_$).filter((e) => _(e) == true).length > 0) {
      message.warning("Some fields are blank. Please Provide.");
      return;
    }

    if (eload?.phone) {
      if (!/^9/.test(eload.phone)) {
        message.warning("Number should start 9*****");
        return;
      } else if (eload.phone.length < 10) {
        message.warning("Invalid number");
      }

      (async () => {
        let a = await onSubmit({
          provider: eload.provider,
          type: eload.type,
          ...(eload.type == "promo" ? { promo: eload.promo } : {}),
          phone: eload?.phone,
          amount: eload.amount,
        });

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
        setEload({
          provider: null,
          phone: null,
          amount: null,
          type: "regular",
          promo: null,
        });
      }}
      title={<Typography.Title level={2}>Load</Typography.Title>}
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
          className="customInput with-prefix"
          onChange={(e) => update("phone", e.target.value)}
          maxLength={10}
          minLength={10}
          prefix="+63"
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
      <Radio.Group
        onChange={(e) => update("type", e.target.value)}
        defaultValue={eload.type}
        style={{
          marginBottom: 10,
        }}
      >
        <Radio value="regular">Regular</Radio>
        <Radio value="promo">Promo</Radio>
      </Radio.Group>
      {eload.type == "promo" && (
        <FloatLabel bool={!_(eload.promo)} label="Promo">
          <Input.TextArea
            className="customInput"
            autoSize={{ minRows: 1, maxRows: 2 }}
            value={eload.promo ?? ""}
            onChange={(e) => update("promo", e.target.value)}
          />
        </FloatLabel>
      )}
      <Button block size="large" type="primary" onClick={handleRequest}>
        CONFIRM
      </Button>
    </Modal>
  );
};

export default Eload;
