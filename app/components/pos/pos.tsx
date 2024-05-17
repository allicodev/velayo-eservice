import React, { useEffect, useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  Checkbox,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  LeftOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { TbCurrencyPeso } from "react-icons/tb";

import { useItemStore, useUserStore } from "@/provider/context";
import ItemService from "@/provider/item.service";
import { BranchData, ItemData, OnlinePayment } from "@/types";
import { AppDispatch, RootState } from "./state/store";
import {
  removeItem,
  updateQuantity,
  newItem,
  incrementQuantity,
  purgeItems,
} from "./state/counterSlice";
import BranchService from "@/provider/branch.service";
import { FloatLabel } from "@/assets/ts";
import PrinterService from "@/provider/printer.service";
import EtcService from "@/provider/etc.service";

// TODO: reduce the item quantity on api after POS transact

const PosHome = ({ open, close }: { open: boolean; close: () => void }) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const [popupItem, setPopupitems] = useState<ItemData[]>([]);
  const [inputQuantity, setInputQuantity] = useState<number | null>();
  const [openItemOpt, setOpenItemOpt] = useState<{
    open: boolean;
    data: ItemData | null;
    mode: "new" | "update" | "";
  }>({ open: false, data: null, mode: "" });
  const [openTender, setOpenTender] = useState(false);

  // refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const [inputSearch, setInputSearch] = useState("");
  const [brans, setBrans] = useState<BranchData | null>(null);
  const [onlinePaymentInput, setOnlinePaymentInput] = useState<OnlinePayment>({
    isOnlinePayment: false,
    portal: "",
    receiverName: "",
    recieverNum: "",
    traceId: "",
  });

  const [form] = Form.useForm();

  // context store
  const { currentUser, currentBranch } = useUserStore();
  const { items } = useItemStore();

  // provider
  const item = new ItemService();
  const branch = new BranchService();
  const printer = new PrinterService();
  const etc = new EtcService();

  // redux
  const selectedItem = useSelector((state: RootState) => state.item);
  const dispatch = useDispatch<AppDispatch>();

  // utils
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [modal, context] = Modal.useModal();

  // tender utils
  const [amount, setAmount] = useState<number | null>(null);

  const onlinePaymentLabels = [
    "Portal",
    "Sender Name",
    "Sender Number/Account Number",
    "Trace ID",
  ];
  const onlinePaymentValues = [
    onlinePaymentInput.portal,
    onlinePaymentInput.receiverName,
    onlinePaymentInput.recieverNum,
    onlinePaymentInput.traceId,
  ];

  const runTimer = (searchWord: string) => {
    setInputSearch(searchWord);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => searchItem(searchWord), 100);
  };

  const searchItem = async (key: string) => {
    let filteredItems = items.filter((e) =>
      e.name.toLocaleLowerCase().includes(key.toLocaleLowerCase())
    );
    setPopupitems(filteredItems);
    // let res = await item.searchItem(key);
    // if (res?.success ?? false) setPopupitems(res?.data ?? []);
  };

  const getItem = async (id: string) => {
    let res = await item.getItemSpecific(id);

    if (res?.success ?? false) {
      setOpenItemOpt({ open: true, data: res?.data ?? null, mode: "new" });
      quantityRef.current?.focus();
    }
  };

  const updateOP = (key: string, value: any) =>
    setOnlinePaymentInput({ ...onlinePaymentInput, [key]: value });

  const confirmQuantity = () => {
    if ([null, 0, undefined].includes(inputQuantity)) {
      message.warning("Cannot Add an Item. Quantity should be greater than 0");
      return;
    }

    setOpenItemOpt({ open: false, data: null, mode: "" });
    setInputSearch("");
    setInputQuantity(null);
    if (openItemOpt.mode == "new") {
      if (selectedItem.some((e) => e._id == openItemOpt.data?._id)) {
        dispatch(
          incrementQuantity({
            id: openItemOpt.data?._id ?? "",
            quantity: inputQuantity!,
          })
        );
      } else {
        if (openItemOpt.data) {
          const {
            _id,
            name,
            itemCode,
            unit,
            quantity: currentQuantity,
            parentName,
            price,
          } = openItemOpt.data;

          dispatch(
            newItem({
              _id,
              name,
              itemCode,
              unit: unit!,
              currentQuantity,
              price,
              parentName: parentName!,
              quantity: inputQuantity!,
            })
          );

          setInputQuantity(null);
        }
      }
    } else if (openItemOpt.mode == "update") {
      dispatch(
        updateQuantity({
          id: openItemOpt.data?._id ?? "",
          quantity: inputQuantity!,
        })
      );
    }

    setPopupitems(items);
  };

  const getTotal = () =>
    selectedItem.reduce((p, n) => p + n.price * n.quantity, 0);

  const handleRequestTransaction = async () => {
    let transactionDetails = JSON.stringify(
      selectedItem.map((e) => ({
        name: e.name,
        price: e.price,
        quantity: e.quantity,
        unit: e.unit,
      }))
    );
    let cash = amount;
    let _amount = getTotal();
    let tellerId = currentUser?._id ?? "";
    let branchId = currentBranch;
    let online = onlinePaymentInput;

    const func /* a newbie function */ = async () => {
      let res = await item.requestTransaction(
        transactionDetails,
        cash!,
        _amount,
        tellerId,
        branchId,
        "",
        online
      );

      if (res?.success ?? false) {
        if (!online.isOnlinePayment)
          modal.confirm({
            title: "Do you want to print the receipt ?",
            okText: "PRINT",
            zIndex: 999999,
            okButtonProps: {
              size: "large",
            },
            cancelButtonProps: {
              size: "large",
            },
            onOk: () => {
              // call proxy server, also call a flag that the print is success

              new Promise(async (resolve, reject) => {
                await printer.printReceiptPos({
                  printData: {
                    itemDetails: JSON.stringify(
                      selectedItem.map((e) => ({
                        name: e.name,
                        unit: e.unit,
                        price: e.price,
                        quantity: e.quantity,
                      }))
                    ),
                    amount: getTotal(),
                    cash: amount!,
                    receiptNo:
                      `3772-${parseInt(
                        (res.data as any)._id.slice(-8).toString(),
                        16
                      )}` ?? "",
                    refNo: "",
                  },
                  tellerId: currentUser?.name ?? "",
                  branchId: currentBranch,
                });

                resolve(true);
              }).then(() => {
                message.success(res?.message ?? "Success");
                setOpenTender(false);
                setAmount(null);
                dispatch(purgeItems());
              });
            },
            onCancel: () => {
              setOpenTender(false);
              setAmount(null);
              dispatch(purgeItems());
            },
          });
        else {
          message.success(res?.message ?? "Success");
          setOpenTender(false);
          setAmount(null);
          dispatch(purgeItems());
        }
      }
    };

    if (onlinePaymentInput.isOnlinePayment)
      return await new Promise(async (resolve, reject) => {
        await etc
          .getTransactionFromTraceId(onlinePaymentInput.traceId)
          .then((e) => (e?.data ? resolve(e.data) : reject()));
      })
        .then((e) => {
          if (e)
            message.warning(
              "This Transaction is already processed. Cannot continue."
            );
          return;
        })
        .catch(() => {
          func();
          return;
        });
    func();
  };

  useEffect(() => {
    let sec = Number.parseInt(dayjs().format("ss"));
    setTimeout(() => {
      setInterval(() => {
        setCurrentTime(dayjs());
      }, 60 * 1000);
    }, 60 * 1000 - sec * 1000);

    (async (_) => {
      let res = await _.getBranchSpecific(currentBranch);

      if (res?.success ?? false) setBrans(res?.data ?? null);
    })(branch);
  }, []);

  useEffect(() => {
    (searchRef.current as any)?.focus();
    setPopupitems(items);

    // return () => {
    //   searchRef.current = null;
    // };
  }, [open]);

  return (
    <>
      <Drawer
        open={open}
        maskClosable={false}
        onClose={close}
        placement="bottom"
        height="100%"
        // keyboard={false}
        title={
          <Typography style={{ fontSize: "1.5em", margin: 0 }}>
            Point of Sale
          </Typography>
        }
        closeIcon={
          <Tooltip title="Back to Home">
            <LeftOutlined />
          </Tooltip>
        }
        styles={{
          body: {
            padding: 0,
          },
          header: {
            padding: 10,
          },
        }}
        zIndex={1}
        extra={[
          <Button
            size="large"
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "1.3em",
              marginRight: 10,
            }}
            onClick={() => {
              if (selectedItem.length == 0) {
                message.warning("No Items Selected");
                return;
              }
              setOpenTender(true);
            }}
          >
            <TbCurrencyPeso />
            TENDER
          </Button>,
        ]}
      >
        <img
          src="/logo-2.png"
          style={{
            position: "absolute",
            left: "50%",
            top: "60%",
            transform: "translate(-50%, -50%)",
            filter: "opacity(0.1) grayscale(0.5) brightness(1.2)",
          }}
        />
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: 150,
            background: "#98c04b",
            padding: 15,
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                width: 150,
                fontSize: "1.35em",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Teller Name</span>
              <span>Branch</span>
              <span>Current Date </span>
            </div>
            <div
              style={{
                width: 250,
                fontSize: "1.35em",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>{currentUser?.name}</span>
              <span>{brans?.name}</span>
              <span>{currentTime?.format("MMMM DD, YYYY hh:mma")}</span>
            </div>
          </div>

          <Typography
            style={{ fontSize: "5em", color: "#fff", alignSelf: "center" }}
          >
            ₱
            {getTotal().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </div>
        {/* end of head */}
        {/* search */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              height: 40,
              background: "#eee",
              fontSize: "1.5em",
              width: 190,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Item/Item Code
          </div>
          <AutoComplete
            className="no-border-radius-autocomplete"
            size="large"
            popupClassName="pos-autocomplete-popup"
            style={{ display: "block", width: "100%" }}
            onChange={runTimer}
            value={inputSearch}
            ref={searchRef}
            onSelect={(_, e) => getItem(e.key)}
            dropdownStyle={{
              width: 1100,
            }}
            filterOption={(inputValue, option) =>
              option!
                .value!.toString()
                .toUpperCase()
                .indexOf(inputValue.toUpperCase()) !== -1
            }
            options={[
              {
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#c5d9ef",
                      height: 35,
                      cursor: "default",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.5em",
                        width: 600,
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        borderLeft: "1px solid #000",
                        display: "block",
                        textAlign: "center",
                      }}
                    >
                      Item
                    </span>
                    <span
                      style={{
                        width: 250,
                        fontSize: "1.5em",
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        display: "block",
                        textAlign: "center",
                      }}
                    >
                      Price
                    </span>
                    <span
                      style={{
                        width: 250,
                        fontSize: "1.5em",
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        textAlign: "center",
                      }}
                    >
                      On Hand Quantity
                    </span>
                  </div>
                ),
                className: "custom-select",
                value: "none",
                key: "none",
              },
              ...popupItem.map((e, i) => ({
                label: (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "1.5em",
                        width: 590.5,
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        borderLeft: "1px solid #000",
                        borderBottom:
                          i == popupItem.length - 1 ? "1px solid #000" : "",
                        paddingLeft: 10,
                      }}
                    >{`${"00000".slice(e.itemCode?.toString().length)}${
                      e.itemCode
                    }: ${e.name}`}</span>
                    <span
                      style={{
                        fontSize: "1.5em",
                        width: 245.5,
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        borderBottom:
                          i == popupItem.length - 1 ? "1px solid #000" : "",
                        paddingLeft: 10,
                        textAlign: "end",
                        paddingRight: 10,
                      }}
                    >
                      {e.price.toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontSize: "1.5em",
                        width: 246,
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                        borderBottom:
                          i == popupItem.length - 1 ? "1px solid #000" : "",
                        paddingLeft: 10,
                        textAlign: "end",
                        paddingRight: 10,
                      }}
                    >
                      {e.quantity}
                    </span>
                  </div>
                ),
                className: "custom-select",
                value: e.name,
                key: e._id,
              })),
            ]}
          />
          <Button
            size="large"
            style={{
              borderRadius: 0,
              width: 200,
            }}
            onClick={() => dispatch(purgeItems())}
          >
            Clear All <CloseOutlined />
          </Button>
        </div>
        {selectedItem.length > 0 && (
          <Table
            locale={{ emptyText: " " }}
            dataSource={selectedItem}
            pagination={false}
            rowKey={(e) => e._id}
            style={{
              width: "60vw",
            }}
            columns={[
              {
                title: "Item Code",
                dataIndex: "itemCode",
                width: 150,
                align: "center",
                render: (_) => `${"00000".slice(_.toString().length)}${_}`,
              },
              { title: "Name", dataIndex: "name", width: 300 },
              { title: "Category", dataIndex: "parentName", width: 300 },
              {
                title: "Price",
                width: 100,
                dataIndex: "price",
                render: (_) =>
                  `₱${_?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
              },
              {
                title: "Quantity",
                dataIndex: "quantity",
                width: 100,
                align: "center",
              },
              {
                width: 1,
                render: (_: any, row: any) => (
                  <Space>
                    <Tooltip title="Remove Item">
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => dispatch(removeItem(row._id))}
                        danger
                      />
                    </Tooltip>
                    <Tooltip title="Edit Item">
                      <Button
                        icon={<EditOutlined />}
                        type="primary"
                        onClick={() => {
                          setOpenItemOpt({
                            open: true,
                            data: row,
                            mode: "update",
                          });
                        }}
                      />
                    </Tooltip>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* context */}
      {context}
      <Modal
        open={openItemOpt.open}
        onCancel={() => {
          setOpenItemOpt({ open: false, data: null, mode: "" });
          setInputQuantity(null);
        }}
        zIndex={2}
        closable={false}
        footer={null}
        width={350}
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Typography style={{ fontSize: "3em" }}>QUANTITY</Typography>
        <InputNumber
          className="custom customInput size-70"
          style={{ width: 300, textAlign: "center" }}
          ref={quantityRef}
          min={1}
          controls={false}
          value={inputQuantity}
          onKeyDown={(e) => {
            if (e.code == "Enter") confirmQuantity();
          }}
          onChange={(e) => {
            if (e) setInputQuantity(e);
          }}
        />
        <Button
          style={{ marginTop: 10, height: 50, width: 300, fontSize: "2em" }}
          type="primary"
          onClick={confirmQuantity}
          block
        >
          SAVE [enter]
        </Button>
      </Modal>

      {/* Tender */}
      <Modal
        open={openTender}
        onCancel={() => {
          setOpenTender(false);
          setAmount(null);
        }}
        keyboard={false}
        closable={false}
        footer={null}
        width={900}
        zIndex={98}
        styles={{
          header: {
            padding: 0,
            margin: 0,
          },
          content: {
            padding: 0,
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title
            level={3}
            style={{
              paddingTop: 5,
              paddingLeft: 15,
              paddingRight: 15,
              margin: 0,
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: 10 }}>₱</span>
            Collection Details
          </Typography.Title>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: 120,
            background: "#98c04b",
            padding: 15,
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                width: 150,
                fontSize: "1.35em",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Teller Name</span>
              <span>Branch</span>
              <span>Current Date </span>
            </div>
            <div
              style={{
                width: 250,
                fontSize: "1.35em",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>{currentUser?.name}</span>
              <span>{brans?.name}</span>
              <span>{currentTime?.format("MMMM DD, YYYY hh:mma")}</span>
            </div>
          </div>

          <Typography
            style={{ fontSize: "4em", color: "#fff", alignSelf: "center" }}
          >
            ₱
            {getTotal().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </div>
        <div>
          <Row>
            <Col span={12}>
              <span
                style={{
                  fontSize: "2.5em",
                  marginLeft: 30,
                }}
              >
                Cash/Amount
              </span>
            </Col>
            <Col span={12} style={{ display: "flex" }}>
              <InputNumber
                size="large"
                className="custom customInput size-70 with-prefix align-end-input-num"
                min={0}
                onChange={setAmount}
                value={amount}
                style={{
                  width: "100%",
                  height: 60,
                  marginTop: 5,
                  marginBottom: 5,
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
                prefix="₱"
                controls={false}
                formatter={(value: any) =>
                  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  marginLeft: 30,
                }}
                onClick={() => {
                  updateOP(
                    "isOnlinePayment",
                    !onlinePaymentInput.isOnlinePayment
                  );
                  if (onlinePaymentInput.isOnlinePayment) {
                    setPaymentSaved(false);
                    setOnlinePaymentInput({
                      isOnlinePayment: false,
                      portal: "",
                      receiverName: "",
                      recieverNum: "",
                      traceId: "",
                      reference: "",
                    });
                  }
                }}
              >
                <Checkbox
                  className="customCheckbox"
                  checked={onlinePaymentInput.isOnlinePayment}
                />
                <span
                  style={{
                    fontSize: "2em",
                    marginLeft: 10,
                  }}
                >
                  Online Payment
                </span>
              </div>
            </Col>
          </Row>
          {onlinePaymentInput.isOnlinePayment && paymentSaved && (
            <>
              {onlinePaymentLabels.map((e, i) => (
                <Row>
                  <Col span={12}>
                    <span
                      style={{
                        fontSize: "1.7em",
                        marginLeft: 30,
                      }}
                    >
                      {e}
                    </span>
                  </Col>
                  <Col span={12} style={{ display: "flex", fontSize: "1.7em" }}>
                    {onlinePaymentValues[i]}
                  </Col>
                </Row>
              ))}
            </>
          )}
        </div>

        <div
          className="tender-bottom-group"
          style={{
            marginTop: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <Row>
            <Col
              span={4}
              style={{
                paddingLeft: 30,
                fontSize: "2em",
                borderLeft: "1px solid #eee",
                borderBottom: "1px solid #eee",
                borderTop: "1px solid #eee",
              }}
            >
              Amount
            </Col>
            <Col
              span={20}
              style={{
                display: "flex",
                justifyContent: "end",
                paddingRight: 30,
                fontSize: "2em",
                border: "1px solid #eee",
              }}
            >
              ₱
              {(amount ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Col>
          </Row>
          <Row>
            <Col
              span={4}
              style={{
                paddingLeft: 30,
                fontSize: "2em",
                borderLeft: "1px solid #eee",
                borderBottom: "1px solid #eee",
                borderBottomLeftRadius: 10,
              }}
            >
              Change
            </Col>
            <Col
              span={20}
              style={{
                display: "flex",
                justifyContent: "end",
                paddingRight: 30,
                fontSize: "2em",
                borderRight: "1px solid #eee",
                borderLeft: "1px solid #eee",
                borderBottom: "1px solid #eee",
                borderBottomRightRadius: 10,
              }}
            >
              ₱
              {(amount ?? 0) <= getTotal()
                ? "0.00"
                : ((amount ?? 0) - getTotal()).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </Col>
          </Row>
        </div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button
            style={{
              margin: 5,
              height: 70,
              width: 210,
              marginRight: 30,
              fontSize: "3em",
              background: getTotal() > (amount ?? 0) ? "#98c04b88" : "#98c04b",
              color: "#fff",
            }}
            disabled={getTotal() > (amount ?? 0)}
            onClick={handleRequestTransaction}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* online payment modal */}
      <Modal
        zIndex={99}
        open={onlinePaymentInput.isOnlinePayment && !paymentSaved}
        onCancel={() => {
          setOnlinePaymentInput({
            isOnlinePayment: false,
            portal: "",
            receiverName: "",
            recieverNum: "",
            traceId: "",
            reference: "",
          });
          form.resetFields();
        }}
        footer={null}
        width={700}
        title={
          <Typography.Title
            level={3}
            style={{
              paddingTop: 5,
              paddingLeft: 15,
              paddingRight: 15,
              margin: 0,
            }}
          >
            Online Payment
          </Typography.Title>
        }
      >
        <Form
          form={form}
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 20,
            gap: 10,
            marginLeft: 10,
            marginRight: 10,
          }}
          onFinish={() => {
            setPaymentSaved(true);
            form.resetFields();
          }}
        >
          <Form.Item
            rules={[
              {
                required: true,
                message: "Portal is required. Please provide",
              },
            ]}
            name="portal"
            noStyle
          >
            <FloatLabel
              value={onlinePaymentInput.portal}
              label="Portal (Payment Wallet Used)"
            >
              <Input
                className="customInput size-70"
                value={onlinePaymentInput.portal}
                style={{
                  height: 70,
                  fontSize: "2em",
                }}
                onChange={(e) => {
                  updateOP("portal", e.target.value);
                  form.setFieldValue("portal", e.target.value);
                }}
              />
            </FloatLabel>
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Sender Name is required. Please provide",
              },
            ]}
            name="receiverName"
            noStyle
          >
            <FloatLabel
              value={onlinePaymentInput.receiverName}
              label="Sender Name (Payees name of payment wallet being sent)"
            >
              <Input
                className="customInput size-70"
                value={onlinePaymentInput.receiverName}
                style={{
                  height: 70,
                  fontSize: "2em",
                }}
                onChange={(e) => {
                  updateOP("receiverName", e.target.value);
                  form.setFieldValue("receiverName", e.target.value);
                }}
              />
            </FloatLabel>
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Sender Number is required. Please provide",
              },
            ]}
            name="recieverNum"
            noStyle
          >
            <FloatLabel
              value={onlinePaymentInput.recieverNum}
              label="Sender Number/Account Number"
            >
              <Input
                className="customInput size-70"
                value={onlinePaymentInput.recieverNum}
                style={{
                  height: 70,
                  fontSize: "2em",
                }}
                onChange={(e) => {
                  updateOP("recieverNum", e.target.value);
                  form.setFieldValue("recieverNum", e.target.value);
                }}
              />
            </FloatLabel>
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Trace ID is required. Please provide",
              },
            ]}
            name="traceId"
            noStyle
          >
            <FloatLabel
              value={onlinePaymentInput.traceId}
              label="Trace ID (date, time, last 4 digits) (e.g 2312121234)"
            >
              <Input
                className="customInput size-70"
                value={onlinePaymentInput.traceId}
                maxLength={10}
                minLength={10}
                style={{
                  height: 70,
                  fontSize: "2em",
                }}
                onChange={(e) => {
                  if (e.target.value == "") {
                    updateOP("traceId", "");
                    form.setFieldValue("traceId", "");
                  }

                  if (!Number.isNaN(Number(e.target.value))) {
                    updateOP("traceId", e.target.value);
                    form.setFieldValue("traceId", e.target.value);
                  }
                }}
              />
            </FloatLabel>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              style={{ height: 70, fontSize: "2em" }}
              block
              htmlType="submit"
            >
              SUBMIT
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PosHome;
