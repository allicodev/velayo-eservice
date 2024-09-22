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
  Popconfirm,
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
import {
  BranchData,
  CreditProp,
  ItemData,
  Log,
  OnlinePayment,
  UserCreditData,
} from "@/types";
import { AppDispatch, RootState } from "../../state/store";
import {
  removeItem,
  updateQuantity,
  newItem,
  incrementQuantity,
  purgeItems,
} from "../../state/counterSlice";
import BranchService from "@/provider/branch.service";
import { FloatLabel } from "@/assets/ts";
import PrinterService from "@/provider/printer.service";
import EtcService from "@/provider/etc.service";
import CreditService from "@/provider/credit.service";
import LogService from "@/provider/log.service";
import { newLog } from "@/app/state/logs.reducers";

// TODO: reduce the item quantity on api after POS transact

const PosHome = ({
  open,
  close,
  search,
}: {
  open: boolean;
  close: () => void;
  search?: string;
}) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const [popupItem, setPopupitems] = useState<ItemData[]>([]);
  const [inputQuantity, setInputQuantity] = useState<number | null>();
  const [price, setPrice] = useState<number | null>();
  const [openItemOpt, setOpenItemOpt] = useState<{
    open: boolean;
    data: ItemData | null;
    mode: "new" | "update" | "";
    id: string;
  }>({ open: false, data: null, mode: "", id: "" });
  const [openTender, setOpenTender] = useState(false);

  // refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef2 = useRef<NodeJS.Timeout | null>(null);
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
  const [credit, setCredit] = useState<CreditProp>({
    isCredit: false,
    userId: "",
    transactionId: "",
    amount: 0,
  });

  const [form] = Form.useForm();

  // context store
  const { currentUser, currentBranch } = useUserStore();
  const { items, setUpdateQuantity } = useItemStore();

  // redux
  const selectedItem = useSelector((state: RootState) => state.item);
  const dispatch = useDispatch<AppDispatch>();

  // utils
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [modal, context] = Modal.useModal();

  // tender utils
  const [amount, setAmount] = useState<number | null>(null);

  // credit
  const [openCredit, setOpenCredit] = useState(false);
  const [users, setUsers] = useState<UserCreditData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCreditData | null>(null);
  const [_selectedUser, _setSelectedUser] = useState<UserCreditData | null>(
    null
  );
  const [interest, setInterest] = useState<number | null>(null);

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
      e.name?.toLocaleLowerCase().includes(key.toLocaleLowerCase())
    );
    setPopupitems(filteredItems);
    // let res = await item.searchItem(key);
    // if (res?.success ?? false) setPopupitems(res?.data ?? []);
  };

  const getItem = async (id: string) => {
    let res = await ItemService.getItemSpecific(id);
    if (res?.success ?? false) {
      setOpenItemOpt({ open: true, data: res?.data ?? null, mode: "new", id });
      if (res?.data?.price != null) quantityRef.current?.focus();
    }
  };

  const processWithTotal = (u: UserCreditData): UserCreditData => {
    u.availableCredit =
      u.history == null || u.history.length == 0
        ? u.maxCredit
        : u.history.reduce(
            (p, n) =>
              p -
              (n.status == "completed"
                ? 0
                : n.history.reduce(
                    (pp, nn) => pp + parseFloat(nn.amount.toString()),
                    0
                  )),
            u.maxCredit
          );

    return u;
  };

  const runTimer2 = (searchWord: string) => {
    if (timerRef2.current) {
      clearTimeout(timerRef2.current);
    }

    timerRef2.current = setTimeout(() => searchUser(searchWord), 100);
  };

  const searchUser = async (searchWord: string) => {
    let res = await CreditService.getUser({ searchWord });

    if (res?.success ?? false) {
      setUsers(res?.data?.map((e) => processWithTotal(e)) ?? []);
    }
  };

  const updateOP = (key: string, value: any) =>
    setOnlinePaymentInput({ ...onlinePaymentInput, [key]: value });

  const updateCredit = (key: string, value: any) =>
    setCredit({ ...credit, [key]: value });

  const confirmQuantity = async () => {
    if ([null, 0, undefined].includes(inputQuantity)) {
      message.warning("Cannot Add an Item. Quantity should be greater than 0");
      return;
    }

    if ([null, 0].includes(openItemOpt.data?.price ?? null) && price == null) {
      message.warning("Cannot Add an Item. Price is empty");
      return;
    }

    let res2 = await BranchService.getItemSpecific(
      currentBranch,
      openItemOpt.id
    );
    const stock_count = (res2 as any[])[0]?.stock_count ?? 0;
    const item: ItemData = (res2 as any[])[0]?.itemId;

    if (
      stock_count <
      (inputQuantity ?? 0) +
        (selectedItem.filter((e) => e._id == openItemOpt.id)[0]?.quantity ?? 0)
    ) {
      message.warning(
        "Cannot Add an Item. Quantity should be lesser than current item quantity"
      );
      return;
    }

    setOpenItemOpt({ open: false, data: null, mode: "", id: "" });
    setInputSearch("");

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
            parentName,
            price: _price,
          } = openItemOpt.data;

          dispatch(
            newItem({
              _id,
              name,
              itemCode,
              unit: unit!,
              currentQuantity: (res2 as any[])[0].stock_count ?? 0,
              price: [null, 0].includes(openItemOpt.data.price)
                ? price!
                : _price!,
              parentName: parentName!,
              quantity: inputQuantity!,
              cost: item.cost,
            })
          );

          setPrice(null);
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

    setInputQuantity(null);
    setPrice(null);
    setPopupitems(items);
  };

  const getTotal = () =>
    selectedItem.reduce((p, n) => p + (n?.price ?? 0) * n.quantity, 0);

  const handleRequestTransaction = async () => {
    if (credit.isCredit) {
      if (selectedUser == null) {
        message.warning("No selected user");
        return;
      }

      if (getTotal() > selectedUser.availableCredit) {
        message.error("Cannot proceed. User Credit is insufficient");
        return;
      }
    }

    return new Promise<string | null>(async (resolve, reject) => {
      if (credit.isCredit && selectedUser != null) {
        // get user credit via id
        let userCredit = await CreditService.getUser({
          _id: selectedUser?._id ?? "",
        });

        let _res = await LogService.newLog({
          userId: currentUser?._id ?? "",
          type: "credit",
          branchId: currentBranch,
          userCreditId: selectedUser._id,
          status: "pending",
          amount: getTotal(),
          dueDate: dayjs().add((userCredit.data![0] as any).creditTerm, "day"),
          interest,
          history: [
            {
              amount: getTotal(),
              date: new Date(),
              description: "Credit Initial",
            },
          ],
        });

        return resolve(_res.data?._id ?? "");
      } else {
        return resolve(null);
      }
    }).then(async (e) => {
      let transactionDetails = JSON.stringify(
        selectedItem.map((e) => ({
          name: e.name,
          price: e.price,
          quantity: e.quantity,
          unit: e.unit,
          cost: e.cost,
          _id: e._id,
        }))
      );
      let cash = amount;
      let _amount = getTotal();
      let tellerId = currentUser?._id ?? "";
      let branchId = currentBranch;
      let online = onlinePaymentInput;

      const func /* a newbie function */ = async () => {
        const fee = selectedItem.reduce(
          (p, n) => p + ((n.price ?? 0) - n.cost) * n.quantity,
          0
        );
        let res = await ItemService.requestTransaction(
          transactionDetails,
          cash!,
          _amount - fee,
          fee,
          tellerId,
          branchId,
          "",
          online,
          e
        );

        if (res?.success ?? false) {
          if (!online.isOnlinePayment) {
            await BranchService.updateItemBranch(
              branchId,
              "misc",
              selectedItem.map((e) => ({
                _id: e._id ?? "",
                count: -e.quantity,
              })),
              (res.data as any)._id
            );

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
                  await PrinterService.printReceiptPos({
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
                  selectedItem.map((e) => {
                    setUpdateQuantity(e?._id ?? "", -e.quantity);
                  });
                  dispatch(purgeItems());
                });
              },
              onCancel: () => {
                setOpenTender(false);
                setAmount(null);
                selectedItem.map((e) => {
                  setUpdateQuantity(e?._id ?? "", -e.quantity);
                });
                dispatch(purgeItems());
                message.success("New Transaction Successfully Added");
              },
            });
          } else {
            message.success(res?.message ?? "Success");
            setOpenTender(false);
            setAmount(null);
            dispatch(purgeItems());
          }

          if (credit.isCredit && selectedUser != null) {
            await LogService.updateLog({
              _id: e,
              transactionId: res.data?._id ?? "",
            });
          }

          if (!onlinePaymentInput.isOnlinePayment && !credit.isCredit) {
            const { success, data } = await LogService.newLog({
              type: "disbursement",
              subType: "transaction",
              transactionId: res.data?._id ?? "",
              userId: currentUser?._id ?? "",
              branchId: currentBranch,
              amount: getTotal(),
            });

            if (success ?? false) {
              dispatch(newLog({ key: "cash", log: data as any as Log }));
            }
          }
          setSelectedUser(null);
          _setSelectedUser(null);
          updateCredit("isCredit", false);
        }
      };

      if (onlinePaymentInput.isOnlinePayment)
        return await new Promise(async (resolve, reject) => {
          await EtcService.getTransactionFromTraceId(
            onlinePaymentInput.traceId
          ).then((e) => (e?.data ? resolve(e.data) : reject()));
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
    });
  };

  const showCreditForm = () => {
    if (selectedUser) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#5999ff",
            padding: 10,
            color: "#fff",
            borderRadius: 10,
            marginLeft: 24,
            marginRight: 24,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 10,
          }}
        >
          <div>
            <Typography.Title level={3} style={{ color: "#fff" }}>
              Payment Credit Applied for:{" "}
            </Typography.Title>
            <span
              style={{
                fontSize: "1.7em",
              }}
            >
              {selectedUser.name +
                " " +
                selectedUser.middlename +
                " " +
                selectedUser.lastname}
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Available Credit: ₱
              {selectedUser.availableCredit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Due Date:{" "}
              {dayjs()
                .add(selectedUser.creditTerm, "day")
                .format("MMM DD, YYYY")}{" "}
              ({selectedUser.creditTerm} days)
            </span>
            <br />
            <span
              style={{
                fontSize: "1.3em",
              }}
            >
              Overdue Interest: {interest}% / day
            </span>
          </div>
          <Popconfirm
            title="Remove Credit"
            description="Are you sure you want to remove?"
            okText="Remove"
            onConfirm={() => {
              setSelectedUser(null);
              _setSelectedUser(null);
              updateCredit("isCredit", false);
            }}
          >
            <Button
              type="text"
              size="large"
              icon={<DeleteOutlined />}
              style={{ background: "#fff" }}
              danger
            >
              remove
            </Button>
          </Popconfirm>
        </div>
      );
    } else return <></>;
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
    })(BranchService);
  }, []);

  useEffect(() => {
    // (searchRef.current as any)?.focus();
    setPopupitems(items);

    if (search != "") setInputSearch(search ?? "");
    // return () => {
    //   searchRef.current = null;
    // };
  }, [open, search]);

  return (
    <>
      <Drawer
        open={open}
        maskClosable={false}
        onClose={() => {
          dispatch(purgeItems());
          close();
        }}
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
            // ref={searchRef}
            onSelect={(_, e) => getItem(e.key)}
            dropdownStyle={{ width: 1100 }}
            filterOption={(inputValue, option) =>
              option!.value
                ?.toString()
                .toUpperCase()
                .indexOf(inputValue.toUpperCase()) !== -1
            }
            autoFocus
            options={
              popupItem.length > 0
                ? [
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
                                i == popupItem.length - 1
                                  ? "1px solid #000"
                                  : "",
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
                                i == popupItem.length - 1
                                  ? "1px solid #000"
                                  : "",
                              paddingLeft: 10,
                              textAlign: "end",
                              paddingRight: 10,
                              color: e.price == undefined ? "#aaa" : undefined,
                            }}
                          >
                            {e.price != undefined
                              ? e.price?.toFixed(2)
                              : "Not Set"}
                          </span>
                          <span
                            style={{
                              fontSize: "1.5em",
                              width: 246,
                              borderTop: "1px solid #000",
                              borderRight: "1px solid #000",
                              borderBottom:
                                i == popupItem.length - 1
                                  ? "1px solid #000"
                                  : "",
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
                      disabled: e.quantity == 0,
                    })),
                  ]
                : []
            }
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
            bordered
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
              {
                title: "Current Quantity",
                dataIndex: "currentQuantity",
                width: 300,
              },
              {
                title: "Price",
                width: 100,
                dataIndex: "price",
                render: (_) =>
                  _ != undefined ? (
                    `₱${_?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ) : (
                    <Typography.Text type="secondary">Not Set</Typography.Text>
                  ),
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
                            id: "",
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
          setOpenItemOpt({ open: false, data: null, mode: "", id: "" });
          setInputQuantity(null);
          setPrice(null);
        }}
        zIndex={2}
        closable={false}
        footer={null}
        width={350}
        styles={{
          content: {
            padding: 10,
          },
          body: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        {[null, 0, undefined].includes(
          items.filter((e) => e._id == openItemOpt.id)[0]?.price
        ) && (
          <div>
            <Typography style={{ fontSize: "3em", textAlign: "center" }}>
              Price
            </Typography>
            <InputNumber
              className="custom customInput size-70"
              style={{ width: 300, textAlign: "center" }}
              min={1}
              controls={false}
              value={price}
              formatter={(value: any) =>
                value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              onKeyDown={(e) => {
                if (e.code == "Enter") quantityRef.current?.focus();
              }}
              onChange={(e) => {
                if (e) setPrice(e);
              }}
            />
          </div>
        )}

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
          {!credit.isCredit && (
            <Row>
              <Col span={12} style={{ display: "flex", alignItems: "center" }}>
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
          )}
          <Row>
            <Col span={12}>
              {!credit.isCredit && (
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
              )}
              {selectedUser == null && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    marginLeft: 30,
                  }}
                  onClick={() => {
                    updateCredit("isCredit", !credit.isCredit);
                    setOpenCredit(true);
                  }}
                >
                  <Checkbox
                    className="customCheckbox"
                    checked={credit.isCredit}
                  />
                  <span
                    style={{
                      fontSize: "2em",
                      marginLeft: 10,
                    }}
                  >
                    Apply Credit
                  </span>
                </div>
              )}
              {selectedUser != null && showCreditForm()}
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
                fontWeight: 900,
              }}
            >
              AMOUNT
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
                fontWeight: 900,
              }}
            >
              CHANGE
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
              background:
                getTotal() > (amount ?? 0) && !credit.isCredit
                  ? "#98c04b88"
                  : "#98c04b",
              color: "#fff",
            }}
            disabled={getTotal() > (amount ?? 0) && !credit.isCredit}
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
      <Modal
        open={openCredit}
        onCancel={() => {
          setOpenCredit(false);
          updateCredit("isCredit", false);
          _setSelectedUser(null);
        }}
        footer={null}
        closable={false}
        destroyOnClose
      >
        <AutoComplete
          size="large"
          className="ctmFontSize"
          placeholder="Search User"
          style={{
            width: "100%",
            height: 50,
            fontSize: "1.5em",
            marginTop: 10,
          }}
          filterOption={(inputValue, option) =>
            option!
              .value!.toString()
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
          options={users
            // .filter((e) => selectedItem.map((_) => _._id).some((_) => _ == e._id)) // ! not working
            .map((e) => ({
              label: (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{e.name + " " + e.middlename + " " + e.lastname}</span>
                  <span>
                    Available Credits:{" "}
                    <strong>
                      ₱
                      {e.availableCredit?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                </div>
              ),
              value: e.name + " " + e.middlename + " " + e.lastname,
              key: e._id,
            }))}
          onChange={(e) => {
            if (e != "") {
              runTimer2(e);
            } else setSelectedUser(null);
          }}
          onSelect={(_, __) => {
            if (
              users.filter((e) => e._id == __.key)[0].availableCredit -
                getTotal() >
              0
            )
              _setSelectedUser(users.filter((e) => e._id == __.key)[0]);
            else
              message.error(
                "Credit cannot applied. Max Credits already reached"
              );
          }}
          autoFocus
        />
        {_selectedUser != null && (
          <div
            style={{
              fontSize: "1.5em",
              marginTop: 10,
              gap: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Overdue Interest per day:</span>
            <InputNumber
              style={{
                width: 100,
              }}
              controls={false}
              onChange={(e) => {
                if (e != null && e != "")
                  setInterest(parseFloat(e.toLocaleString()));
                else setInterest(null);
              }}
              onPressEnter={() => {
                setOpenCredit(false);
                setSelectedUser(_selectedUser);
              }}
              size="large"
              addonAfter="%"
            />
          </div>
        )}
        <Button
          size="large"
          type="primary"
          style={{ marginTop: 10 }}
          disabled={_selectedUser == null || interest == null}
          onClick={() => {
            setOpenCredit(false);
            setSelectedUser(_selectedUser);
          }}
          block
        >
          CONFIRM
        </Button>
      </Modal>
    </>
  );
};

export default PosHome;
