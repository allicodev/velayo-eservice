import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  InputNumber,
  Radio,
  Row,
  Space,
  Typography,
  Modal,
  message,
  Input,
  Tabs,
  Card,
  Tooltip,
  Alert,
} from "antd";
import { DownOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";

import {
  BillingsFormField,
  BillsSettings,
  OptionTypeWithFlag,
  Wallet,
  WalletType,
} from "@/types";
import { NewWallet, NewOption } from "./modals";
import WalletService from "@/provider/wallet.service";
import { FloatLabel } from "@/assets/ts";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

const EWalletSettings = ({ open, close }: BillsSettings) => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [updated, setUpdated] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [walletOptions, setWalletOptions] = useState<OptionTypeWithFlag>({
    open: false,
    options: null,
    index: -1,
    id: null,
  });

  // for context
  const [contextName, setContextName] = useState("");
  const [openUpdateName, setOpenUpdateName] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState("fee-settings-tabs");

  const wallet = new WalletService();

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

  const clearAll = () => {
    setSelectedWallet(null);
    close();
  };

  const cashinHasNoMainAMount = () =>
    selectedWallet?.cashInFormField
      .filter((e) => e.type == "number")
      .map((e) => e.inputNumberOption?.mainAmount)
      .filter((e) => e == true).length == 0;
  const cashoutHasNoMainAMount = () =>
    selectedWallet?.cashOutFormField
      .filter((e) => e.type == "number")
      .map((e) => e.inputNumberOption?.mainAmount)
      .filter((e) => e == true).length == 0;

  const getTabsAsWalletType = (): WalletType =>
    selectedTabs == "cashin-settings-tabs" ? "cash-in" : "cash-out";

  const renderSettingsForm = (_wallet: Wallet, type: WalletType) => {
    const selectedFormField: BillingsFormField[] =
      type == "cash-in" ? _wallet.cashInFormField : _wallet.cashOutFormField;

    const billingButton = (formField: BillingsFormField): ReactNode => {
      let index = selectedFormField?.indexOf(formField) ?? -1;

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
                setWalletOptions({
                  open: true,
                  options: selectedFormField![index ?? -1],
                  index,
                  id: selectedWallet?._id ?? null,
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
      <div>
        <Typography.Title>{_wallet.name} Fee Settings</Typography.Title>
        {cashinHasNoMainAMount() && (
          <Alert
            type="error"
            message="There are no main amount selected on Cash-In."
            style={{
              marginBottom: 5,
              width: 280,
            }}
          />
        )}
        {cashoutHasNoMainAMount() && (
          <Alert
            type="error"
            message="There are no main amount selected on Cash-out."
            style={{
              marginBottom: 5,
              width: 290,
            }}
          />
        )}
        <Card
          styles={{
            body: {
              padding: 5,
              background: "#fefefe",
              borderRadius: 10,
            },
          }}
        >
          <Tabs
            type="card"
            onChange={setSelectedTabs}
            items={[
              {
                label: "Fee Settings",
                key: "fee-settings-tabs",
                children: (
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          marginLeft: 15,
                        }}
                      >
                        Cash-In Fee Settings
                      </strong>
                      <FloatLabel
                        label="Fee"
                        value={selectedWallet?.cashinFeeValue?.toString()}
                        style={{
                          marginLeft: 15,
                          marginTop: 5,
                        }}
                      >
                        <InputNumber
                          prefix={_wallet.cashinType == "percent" ? "%" : "₱"}
                          value={_wallet.cashinFeeValue}
                          className="customInput"
                          size="large"
                          style={{
                            width: 120,
                          }}
                          onChange={(e) => {
                            setSelectedWallet({
                              ..._wallet,
                              cashinFeeValue: e,
                            });
                            setUpdated(true);
                          }}
                          controls={false}
                        />
                      </FloatLabel>
                      <Radio.Group
                        style={{
                          marginLeft: 15,
                        }}
                        onChange={(e) => {
                          setSelectedWallet({
                            ..._wallet,
                            cashinType: e.target.value,
                          });
                          setUpdated(true);
                        }}
                        value={_wallet.cashinType}
                      >
                        <Radio value="percent">Percent</Radio>
                        <Radio value="fixed">Fixed</Radio>
                      </Radio.Group>
                    </div>
                    <Divider
                      type="vertical"
                      style={{
                        height: 120,
                      }}
                    />
                    <div>
                      <strong
                        style={{
                          marginLeft: 15,
                        }}
                      >
                        Cash-Out Fee Settings
                      </strong>
                      <FloatLabel
                        label="Fee"
                        value={selectedWallet?.cashoutFeeValue?.toString()}
                        style={{
                          marginLeft: 15,
                          marginTop: 5,
                        }}
                      >
                        <InputNumber
                          prefix={_wallet.cashoutType == "percent" ? "%" : "₱"}
                          value={_wallet.cashoutFeeValue}
                          className="customInput"
                          size="large"
                          style={{
                            width: 120,
                          }}
                          onChange={(e) => {
                            setSelectedWallet({
                              ..._wallet,
                              cashoutFeeValue: e,
                            });
                            setUpdated(true);
                          }}
                          controls={false}
                        />
                      </FloatLabel>
                      <Radio.Group
                        style={{
                          marginLeft: 15,
                        }}
                        onChange={(e) => {
                          setSelectedWallet({
                            ..._wallet,
                            cashoutType: e.target.value,
                          });
                          setUpdated(true);
                        }}
                        value={_wallet.cashoutType}
                      >
                        <Radio value="percent">Percent</Radio>
                        <Radio value="fixed">Fixed</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                ),
              },
              {
                label: "Cash-in Settings",
                key: "cashin-settings-tabs",
                children: selectedFormField?.length != 0 && (
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

                        if (selectedFormField && selectedWallet) {
                          const items = reorder(
                            selectedFormField,
                            result.source.index,
                            result.destination.index
                          );

                          let _: Wallet = {
                            ...selectedWallet,
                            cashInFormField: items,
                          };

                          // call api and update the current option position
                          (async (b) => {
                            if (selectedWallet?._id != undefined) {
                              let res = await b.updateWalletOption(
                                selectedWallet._id,
                                _
                              );

                              if (res.success)
                                message.success(res?.message ?? "Success");
                            }
                          })(wallet);

                          setSelectedWallet(_);
                        }
                      }}
                    >
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {selectedFormField?.map((item, index) => (
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
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Space>
                ),
              },
              {
                label: "Cash-out Settings",
                key: "cashout-settings-tabs",
                children: selectedFormField?.length != 0 && (
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

                        if (selectedFormField && selectedWallet) {
                          const items = reorder(
                            selectedFormField,
                            result.source.index,
                            result.destination.index
                          );

                          let _: Wallet = {
                            ...selectedWallet,
                            cashOutFormField: items,
                          };

                          // call api and update the current option position
                          (async (b) => {
                            if (selectedWallet?._id != undefined) {
                              let res = await b.updateWalletOption(
                                selectedWallet._id,
                                _
                              );

                              if (res.success)
                                message.success(res?.message ?? "Success");
                            }
                          })(wallet);

                          setSelectedWallet(_);
                        }
                      }}
                    >
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {selectedFormField?.map((item, index) => (
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
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </div>
    );
  };

  const getWallets = () => {
    (async (_) => {
      let res = await _.getWallet();
      if (res.success) {
        setWallets(res?.data ?? []);

        if (selectedWallet != null) {
          if (res.data)
            setSelectedWallet(res.data[wallets.indexOf(selectedWallet)]);
        }
      }
    })(wallet);
  };

  const handleNewWallet = async (_wallet: Wallet): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (
        wallets
          .map((e) => e.name)
          .filter(
            (e) => e.toLocaleLowerCase() == _wallet?.name.toLocaleLowerCase()
          ).length > 0
      ) {
        reject("Wallet already added");
        return;
      }

      (async (_) => {
        let res = await _.newWallet(_wallet);

        if (res.success) {
          message.success(res?.message ?? "Success");
          setTrigger(trigger + 1);
          resolve("Successfully Added");
        } else reject("Error in the server.");
      })(wallet);
    });
  };

  const handleUpdateName = () => {
    (async (_) => {
      if (selectedWallet?._id) {
        let res = await _.updateName(selectedWallet?._id, contextName);
        if (res.success) {
          message.success(res?.message ?? "Success");
          setOpenUpdateName(false);
          setTrigger(trigger + 1);
        }
      }
    })(wallet);
  };

  const handleSave = () => {
    (async (_) => {
      if (selectedWallet) {
        let res = await _.updateWalletFee(selectedWallet);
        if (res.success) {
          message.success(res?.message ?? "Success");
          setTrigger(trigger + 1);
        }
      }
    })(wallet);
  };

  const handleNewOption = (opt: BillingsFormField) => {
    if (walletOptions.options != null) {
      (async (_) => {
        if (selectedWallet?._id != undefined) {
          let res = await _.updateWalletFormFields(
            selectedWallet?._id,
            opt,
            selectedIndex,
            getTabsAsWalletType()
          );

          if (res.success) {
            setWalletOptions({
              open: false,
              options: null,
              index: -1,
              id: null,
            });
            setTrigger(trigger + 1);
            message.success(res?.message ?? "Success");
          }
        }
      })(wallet);
    } else {
      (async (_) => {
        if (selectedWallet?._id != undefined) {
          let res = await _.pushToFormFields(
            selectedWallet?._id,
            opt,
            getTabsAsWalletType()
          );

          if (res.success) {
            setWalletOptions({
              open: false,
              options: null,
              index: -1,
              id: null,
            });
            setTrigger(trigger + 1);
            message.success(res?.message ?? "Success");
          }
        }
      })(wallet);
    }
  };

  const handleMarkAsMain = (id: string, index: number) => {
    return (async (_) => {
      if (id) {
        let res = await _.markWalletMainAmount(
          id,
          index,
          getTabsAsWalletType()
        );

        if (res.success) {
          message.success(res?.message ?? "Success");
          return true;
        }
      }
    })(wallet);
  };

  const handleDeleteOption = (id: string, index: number) => {
    return (async (_) => {
      if (id) {
        let res = await _.removeWalletOptionIndexed(
          id,
          index,
          getTabsAsWalletType()
        );

        if (res.success) {
          message.success(res?.message ?? "Success");
          return true;
        }
      }
    })(wallet);
  };

  useEffect(() => {
    getWallets();
  }, [open, trigger]);

  return (
    <>
      <Drawer
        open={open}
        onClose={clearAll}
        width="100%"
        height="100%"
        closeIcon={<DownOutlined />}
        placement="bottom"
        title={
          <Typography.Text style={{ fontSize: 25 }}>
            Wallet Settings
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
              {wallets.map((e, i) => (
                <Button
                  key={`wallet-btn-${i}`}
                  style={{
                    width: 280,
                    fontSize: 30,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                    ...(selectedWallet?.name == e.name ?? false
                      ? {
                          background: "#294B0F",
                          color: "#fff",
                        }
                      : {
                          background: "#fff",
                          color: "#000",
                        }),
                  }}
                  onClick={() => setSelectedWallet(e)}
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
              onClick={() => setOpenNewWallet(true)}
            >
              New Wallet
            </Button>
          </Col>
          <Col span={1}>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11} style={{ width: "100%" }}>
            {selectedWallet != null &&
              renderSettingsForm(selectedWallet, getTabsAsWalletType())}
            {selectedWallet != null && selectedTabs == "fee-settings-tabs" ? (
              <Space
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  ghost
                  style={{
                    width: 150,
                  }}
                  onClick={() => setOpenUpdateName(true)}
                >
                  Update Name
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={!updated}
                  style={{
                    width: 150,
                  }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Space>
            ) : ["cashin-settings-tabs", "cashout-settings-tabs"].includes(
                selectedTabs
              ) ? (
              <Space style={{ position: "absolute", right: 0, bottom: 0 }}>
                <Button
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => {
                    setWalletOptions({
                      open: true,
                      options: null,
                      index: -1,
                      id: null,
                    });
                  }}
                >
                  Add New Option
                </Button>
              </Space>
            ) : null}
          </Col>
        </Row>
      </Drawer>

      {/* context */}
      <Modal
        open={openUpdateName}
        onCancel={() => setOpenUpdateName(false)}
        closable={false}
        title="Update Name"
        footer={[
          <Button
            key="footer-key"
            onClick={handleUpdateName}
            type="primary"
            size="large"
          >
            Update
          </Button>,
        ]}
      >
        <FloatLabel label="Name" value={contextName}>
          <Input
            className="customInput"
            onChange={(e) => setContextName(e.target.value)}
            size="large"
          />
        </FloatLabel>
      </Modal>
      <NewWallet
        open={openNewWallet}
        close={() => setOpenNewWallet(false)}
        onSave={handleNewWallet}
      />
      <NewOption
        open={walletOptions.open}
        close={() =>
          setWalletOptions({ open: false, options: null, index: -1, id: null })
        }
        onSave={handleNewOption}
        formfield={walletOptions.options}
        index={walletOptions.index}
        id={walletOptions.id}
        refresh={() => setTrigger(trigger + 1)}
        markAsMain={handleMarkAsMain}
        deleteOption={handleDeleteOption}
      />
    </>
  );
};

export default EWalletSettings;
