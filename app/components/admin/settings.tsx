import React, { useEffect, useState } from "react";
import { Button, InputNumber, Space, Tabs, message } from "antd";
import { FloatLabel } from "@/assets/ts";
import EtcService from "@/provider/etc.service";

interface State {
  fee: number | undefined | null;
  threshold: number | undefined | null;
  additionalFee: number | undefined | null;
}

const Settings = () => {
  const [feeOpt, setFeeOpt] = useState<State>({
    fee: null,
    threshold: null,
    additionalFee: null,
  });

  const etc = new EtcService();

  const handleUpdate = async () => {
    let res = await etc.updateEloadSettings(feeOpt);

    if (res?.success ?? false) {
      message.success(res?.message ?? "Success");
    }
  };

  useEffect(() => {
    (async (_) => {
      let res = await _.getEloadSettings();

      if (res?.success ?? false) {
        setFeeOpt({
          fee: res?.data?.fee,
          threshold: res?.data?.threshold,
          additionalFee: res?.data?.additionalFee,
        });
      }
    })(etc);
  }, []);

  return (
    <>
      <Tabs
        tabPosition="left"
        items={[
          {
            label: "E-LOAD SETTINGS",
            key: "eload",
            children: (
              <Space direction="vertical" size={1} style={{ marginLeft: 10 }}>
                <FloatLabel label="Fee" value={feeOpt.fee?.toString()}>
                  <InputNumber<number>
                    controls={false}
                    className="customInput"
                    size="large"
                    prefix="₱"
                    value={feeOpt.fee}
                    formatter={(value: any) =>
                      value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{
                      width: 150,
                    }}
                    onChange={(e) => setFeeOpt({ ...feeOpt, fee: e })}
                  />
                </FloatLabel>

                <FloatLabel
                  label="Threshold"
                  value={feeOpt.threshold?.toString()}
                >
                  <InputNumber<number>
                    controls={false}
                    className="customInput"
                    size="large"
                    prefix="₱"
                    value={feeOpt.threshold}
                    formatter={(value: any) =>
                      value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{
                      width: 150,
                    }}
                    onChange={(e) => setFeeOpt({ ...feeOpt, threshold: e })}
                  />
                </FloatLabel>
                <FloatLabel
                  label="Addional Fee per Threshold"
                  value={feeOpt.additionalFee?.toString()}
                >
                  <InputNumber<number>
                    controls={false}
                    className="customInput"
                    size="large"
                    prefix="₱"
                    value={feeOpt.additionalFee}
                    formatter={(value: any) =>
                      value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{
                      width: 230,
                    }}
                    onChange={(e) => setFeeOpt({ ...feeOpt, additionalFee: e })}
                  />
                </FloatLabel>
                <Button
                  size="large"
                  type="primary"
                  style={{
                    width: 230,
                    marginTop: 10,
                  }}
                  disabled={
                    Object.values(feeOpt).filter((e) => e == null).length > 0
                  }
                  onClick={handleUpdate}
                >
                  SAVE
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </>
  );
};

export default Settings;
