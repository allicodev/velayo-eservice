import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Row,
  Space,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  DownOutlined,
  PlusOutlined,
  SettingOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

import {
  BillsSettings,
  BillingSettingsType,
  BillingsFormField,
  OptionTypeWithFlag,
  UpdateFeeProps,
} from "@/types";

import { NewBiller, NewOption, UpdateBiller } from "./modals";
import BillService from "@/provider/bill.service";
import { FloatLabel } from "@/assets/ts";

type State = {
  fee: number | null;
  threshold: number | null;
  additionalFee: number | null;
};

const BillingSettings = ({ open, close }: BillsSettings) => {
  const [billers, setBillers] = useState<BillingSettingsType[]>([]);
  const [trigger, setTrigger] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [feeOpt, setFeeOpt] = useState<State>({
    fee: null,
    threshold: null,
    additionalFee: null,
  });
  const [selectedTab, setSelectedTab] = useState("");

  const [selectedBiller, setSelectedBiller] =
    useState<BillingSettingsType | null>();
  const [openNewBiller, setOpenNewBiller] = useState(false);
  const [openUpdatedBiller, setOpenUpdatedBiller] = useState(false);
  const [billsOptions, setBillsOptions] = useState<OptionTypeWithFlag>({
    open: false,
    options: null,
    index: -1,
    id: null,
  });

  const bill = new BillService();

  const getItemStyle = (
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
    isDragging: boolean
  ) => ({
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    background: isDragging ? "#aaa" : "transparent",
    ...draggableStyle,
  });

  const reorder = (
    list: BillingsFormField[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const getSideB = (billingFormField: BillingSettingsType) => {
    const billingButton = (formField: BillingsFormField): ReactNode => {
      let index = billingFormField.formField?.indexOf(formField) ?? -1;

      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip
            title={
              formField &&
              formField.type == "number" &&
              formField.inputNumberOption?.mainAmount
                ? "This is the field where the main amount is calculated along with fee"
                : ""
            }
          >
            <div
              onClick={() => {
                setBillsOptions({
                  open: true,
                  options: billingFormField.formField![index ?? -1],
                  index,
                  id: selectedBiller?._id ?? null,
                });
                setSelectedIndex(index ?? -1);
              }}
              style={{
                display: "flex",
                cursor: "pointer",
              }}
            >
              <span style={{ marginRight: 10, fontSize: 25 }}>
                {index! + 1}.
              </span>
              <div
                className="billing-button"
                style={{
                  background: "#fff",
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  border: "0.5px solid #D9D9D9",
                  borderRadius: 3,
                  display: "flex",
                  ...(formField &&
                  formField.type == "number" &&
                  formField.inputNumberOption?.mainAmount
                    ? {
                        border: "1px solid #294B0F",
                      }
                    : {}),
                }}
              >
                <span style={{ fontSize: 18, marginRight: 5 }}>
                  {formField.name}
                </span>
                <div
                  style={{
                    background: "#F0F5FF",
                    color: "#2F54EB",
                    padding: 3,
                    paddingLeft: 5,
                    paddingRight: 5,
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {formField?.type?.toLocaleUpperCase()}
                </div>
              </div>
            </div>
          </Tooltip>
          {formField &&
            formField.type == "number" &&
            formField.inputNumberOption?.mainAmount && (
              <span style={{ marginLeft: 10 }}>- MAIN</span>
            )}
        </div>
      );
    };

    return (
      <>
        <Typography.Title style={{ textAlign: "center" }}>
          {billingFormField.name.toLocaleUpperCase()} bills settings{" "}
        </Typography.Title>
        <Card
          styles={{
            body: {
              padding: 5,
              background: "#fefefe",
              borderRadius: 10,
            },
          }}
        >
          <Space direction="vertical" style={{ display: "block" }}>
            <Tabs
              type="card"
              onChange={setSelectedTab}
              items={[
                {
                  label: "Form Settings",
                  key: "form-settings-tab",
                  children: billingFormField?.formField?.length != 0 && (
                    <Space
                      direction="vertical"
                      style={{
                        display: "block",
                      }}
                    >
                      <DragDropContext
                        onDragEnd={(result) => {
                          if (!result.destination) {
                            return;
                          }

                          if (billingFormField.formField) {
                            const items = reorder(
                              billingFormField.formField,
                              result.source.index,
                              result.destination.index
                            );

                            let _: BillingSettingsType = {
                              _id: selectedBiller?._id ?? "",
                              name: selectedBiller?.name ?? "",
                              fee: selectedBiller?.fee ?? 0,
                              threshold: selectedBiller?.threshold ?? 0,
                              additionalFee: selectedBiller?.additionalFee ?? 0,
                              formField: items,
                            };

                            // call api and update the current option position
                            (async (b) => {
                              if (selectedBiller?._id != undefined) {
                                let res = await b.updateBillOption(
                                  selectedBiller._id,
                                  _
                                );

                                if (res.success)
                                  message.success(res?.message ?? "Success");
                              }
                            })(bill);

                            setSelectedBiller(_);
                          }
                        }}
                      >
                        <Droppable droppableId="droppable">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {billingFormField.formField?.map(
                                (item, index) => (
                                  <Draggable
                                    key={`${item.type}-${index}`}
                                    draggableId={`${item.type}-${index}`}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.dragHandleProps}
                                        {...provided.draggableProps}
                                        style={getItemStyle(
                                          provided.draggableProps.style,
                                          snapshot.isDragging
                                        )}
                                      >
                                        <div>{billingButton(item)}</div>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Space>
                  ),
                },
                {
                  label: "Fee Settings",
                  key: "fee-settings-tab",
                  children: (
                    <Space
                      direction="vertical"
                      size={1}
                      style={{ marginLeft: 10 }}
                    >
                      <FloatLabel label="Fee" value={feeOpt.fee?.toString()}>
                        <InputNumber<number>
                          controls={false}
                          className="customInput"
                          size="large"
                          prefix="₱"
                          value={feeOpt.fee}
                          formatter={(value: any) =>
                            value
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
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
                            value
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
                          style={{
                            width: 150,
                          }}
                          onChange={(e) =>
                            setFeeOpt({ ...feeOpt, threshold: e })
                          }
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
                            value
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
                          style={{
                            width: 250,
                          }}
                          onChange={(e) =>
                            setFeeOpt({ ...feeOpt, additionalFee: e })
                          }
                        />
                      </FloatLabel>
                    </Space>
                  ),
                },
              ]}
            />
          </Space>
        </Card>
      </>
    );
  };

  const getBillers = () => {
    (async (_) => {
      let res = await _.getBill();
      if (res.success) setBillers(res.data ?? []);
      if (selectedBiller != null) {
        if (res.data)
          setSelectedBiller(res.data[billers.indexOf(selectedBiller)]);
      }
    })(bill);
  };

  const handleNewBiller = (name: string) => {
    (async (_) => {
      let res = await _.newBill(name);

      if (res.success) {
        message.success(res.message ?? "Successfully Added");
        setOpenNewBiller(false);
        if (res.data) setBillers([...billers, res.data]);
      }
    })(bill);
  };

  const handleNewOption = (opt: BillingsFormField) => {
    if (billsOptions.options != null) {
      (async (_) => {
        if (selectedBiller?._id != undefined) {
          let res = await _.updateFormFields(
            selectedBiller?._id,
            opt,
            selectedIndex
          );

          if (res.success) {
            setBillsOptions({
              open: false,
              options: null,
              index: -1,
              id: null,
            });
            setTrigger(trigger + 1);
            message.success(res?.message ?? "Success");
          }
        }
      })(bill);
    } else {
      (async (_) => {
        if (selectedBiller?._id != undefined) {
          let res = await _.pushToFormFields(selectedBiller?._id, opt);

          if (res.success) {
            setBillsOptions({
              open: false,
              options: null,
              index: -1,
              id: null,
            });
            setTrigger(trigger + 1);
            message.success(res?.message ?? "Success");
          }
        }
      })(bill);
    }
  };
  const handleSaveFee = () => {
    let _fee: UpdateFeeProps = {
      id: selectedBiller?._id ?? "",
      fee: feeOpt?.fee ?? 0,
      threshold: feeOpt?.threshold ?? 0,
      additionalFee: feeOpt?.additionalFee ?? 0,
    };

    (async (_) => {
      let res = await _.updateFee(_fee);

      if (res?.success) {
        setSelectedBiller(res.data);
        message.success(res?.message ?? "Success");
        setTrigger(trigger + 1);
      }
    })(bill);
  };

  useEffect(() => {
    if (open) getBillers();
  }, [open, trigger]);

  useEffect(() => {
    if (selectedBiller)
      setFeeOpt({
        fee: selectedBiller.fee,
        threshold: selectedBiller.threshold,
        additionalFee: selectedBiller.additionalFee,
      });
  }, [selectedBiller]);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          setSelectedBiller(null);
          close();
        }}
        width="100%"
        height="100%"
        closeIcon={<DownOutlined />}
        placement="bottom"
        title={
          <Typography.Text style={{ fontSize: 25 }}>
            Bills Settings
          </Typography.Text>
        }
        style={{
          borderTopLeftRadius: 25,
          borderBottomLeftRadius: 25,
          display: "flex",
          justifyContent: "center",
          background: "#eee",
        }}
        rootStyle={{
          marginTop: 20,
          marginLeft: 20,
          marginBottom: 20,
        }}
      >
        <Row
          style={{
            height: "100%",
          }}
        >
          <Col
            span={12}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Space direction="vertical">
              {billers.map((e, i) => (
                <Button
                  key={`billing-btn-${i}`}
                  style={{
                    width: 280,
                    fontSize: 30,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                    ...(selectedBiller?.name == e.name ?? false
                      ? {
                          background: "#294B0F",
                          color: "#fff",
                        }
                      : {
                          background: "#fff",
                          color: "#000",
                        }),
                  }}
                  onClick={() => setSelectedBiller(e)}
                >
                  {e.name.toLocaleUpperCase()}
                </Button>
              ))}
            </Space>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              style={{
                width: 150,
                position: "absolute",
                right: 0,
                bottom: 0,
              }}
              onClick={() => setOpenNewBiller(true)}
            >
              New Biller
            </Button>
          </Col>
          <Col span={1}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11} style={{ width: "100%" }}>
            {selectedBiller != null && getSideB(selectedBiller)}
            {
              selectedBiller != null &&
              // <FloatButton.Group
              //   trigger="hover"
              //   type="primary"
              //   icon={<SettingOutlined />}
              // >
              selectedTab == "form-settings-tab" ? (
                <Space style={{ position: "absolute", right: 0, bottom: 0 }}>
                  <Button
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() =>
                      setBillsOptions({
                        open: true,
                        options: null,
                        index: -1,
                        id: null,
                      })
                    }
                  >
                    Add New Option
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    type="primary"
                    onClick={() => setOpenUpdatedBiller(true)}
                    size="large"
                  >
                    Update Biller Name
                  </Button>
                </Space>
              ) : selectedTab == "fee-settings-tab" ? (
                <Space style={{ position: "absolute", right: 0, bottom: 0 }}>
                  <Button
                    icon={<SaveOutlined />}
                    type="primary"
                    onClick={handleSaveFee}
                    size="large"
                  >
                    Update Fee
                  </Button>
                </Space>
              ) : null
              // </FloatButton.Group>
            }
          </Col>
        </Row>
      </Drawer>

      {/* context */}
      <NewBiller
        open={openNewBiller}
        close={() => setOpenNewBiller(false)}
        onSave={(e) => {
          if (
            billers
              .map((_) => _.name)
              .filter((__) => __.toLocaleUpperCase() == e.toLocaleUpperCase())
              .length > 0
          )
            return true;

          handleNewBiller(e);
        }}
      />
      <UpdateBiller
        open={openUpdatedBiller}
        close={() => setOpenUpdatedBiller(false)}
        onSave={(e) => {
          if (
            billers
              .map((_) => _.name)
              .filter((__) => __.toLocaleUpperCase() == e.toLocaleUpperCase())
              .length > 0
          )
            return true;

          (async (_) => {
            if (selectedBiller?._id != undefined) {
              let res = await _.updateBillName(selectedBiller?._id, e);

              if (res.success) {
                message.success(res?.message ?? "Success");
                setOpenUpdatedBiller(false);
                setTrigger(trigger + 1);
              }
            }
          })(bill);
        }}
        name={selectedBiller?.name ?? ""}
      />
      <NewOption
        open={billsOptions.open}
        close={() =>
          setBillsOptions({ open: false, options: null, index: -1, id: null })
        }
        onSave={handleNewOption}
        formfield={billsOptions.options}
        index={billsOptions.index}
        id={billsOptions.id}
        refresh={() => setTrigger(trigger + 1)}
      />
    </>
  );
};

export default BillingSettings;
