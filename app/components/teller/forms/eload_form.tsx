import React, { useEffect, useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Typography,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";

import type {
  CreditProp,
  Eload,
  EloadProps,
  EloadSettings,
  Log,
  UserCreditData,
} from "@/types";

import { FloatLabel, checkProvider } from "@/assets/ts";
import jason from "@/assets/json/constant.json";
import EtcService from "@/provider/etc.service";
import CreditService from "@/provider/credit.service";
import LogService from "@/provider/log.service";
import { useUserStore } from "@/provider/context";
import { newLog } from "@/app/state/logs.reducers";

// lodash
const _ = (__: any) => [null, undefined, ""].includes(__);

const Eload = ({ open, close, onSubmit }: EloadProps) => {
  const [disabledEload, setDisabledEload] = useState<EloadSettings | null>(
    null
  );
  const [users, setUsers] = useState<UserCreditData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCreditData | null>(null);
  const [_selectedUser, _setSelectedUser] = useState<UserCreditData | null>(
    null
  );
  const [interest, setInterest] = useState<number | null>(null);
  const [openCredit, setOpenCredit] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { currentUser, currentBranch } = useUserStore();

  const dispatch = useDispatch();

  const [credit, setCredit] = useState<CreditProp>({
    isCredit: false,
    userId: "",
    transactionId: "",
    amount: 0,
  });

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

  const updateCredit = (key: string, value: any) =>
    setCredit({ ...credit, [key]: value });

  const runTimer = (searchWord: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => searchUser(searchWord), 100);
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

  const searchUser = async (searchWord: string) => {
    let res = await CreditService.getUser({ searchWord });

    if (res?.success ?? false) {
      setUsers(res?.data?.map((e) => processWithTotal(e)) ?? []);
    }
  };

  const handleRequest = () => {
    // validate
    if (eload.provider == null) {
      message.warning("Provider is Blank. Please provide.");
      return;
    }

    if (!eload.phone || eload.phone == "") {
      message.warning("Phone Number is empty. Please Provide.");
      return;
    }

    if (eload.phone.length < 10) {
      message.warning("Phone Number should have a minimum length of 10.");
      return;
    }

    if (!/^9/.test(eload.phone)) {
      message.warning("Phone Number is invalid.");
      return;
    }

    if (!eload.amount) {
      message.warning("Amount is empty. Please Provide.");
      return;
    }

    if (eload.type == "promo" && !eload.promo) {
      message.warning("Promo is empty. Please Provide.");
      return;
    }

    if (checkProvider(eload.phone) == "Invalid Number") {
      message.warning("Invalid Number");
      return;
    }

    if (credit.isCredit) {
      if (selectedUser == null) {
        message.warning("No selected user");
        return;
      }

      if (eload.amount + getFee()! > selectedUser.availableCredit) {
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
          amount: eload.amount! + getFee()!,
          dueDate: dayjs().add((userCredit.data![0] as any).creditTerm, "day"),
          interest,
          history: [
            {
              amount: eload.amount! + getFee()!,
              date: new Date(),
              description: "Credit Initial",
            },
          ],
        });

        return resolve(_res.data?._id ?? "");
      } else {
        return resolve(null);
      }
    }).then((e) => {
      (async () => {
        let a = await onSubmit({
          provider: eload.provider,
          type: eload.type,
          ...(eload.type == "promo" ? { promo: eload.promo } : {}),
          phone: eload?.phone,
          amount: eload.amount,
          fee: getFee(),
          creditId: e,
        });

        if (a.success ?? false) {
          message.success("Successfully Requested");
          setEload({
            provider: null,
            phone: null,
            amount: null,
            type: "regular",
            promo: null,
          });

          if (credit.isCredit && selectedUser != null) {
            await LogService.updateLog({
              _id: e,
              transactionId: a.data?._id ?? "",
            });
          }

          // creating a log for cash box if not credit
          if (!credit.isCredit) {
            const { success, data } = await LogService.newLog({
              type: "disbursement",
              subType: "transaction",
              transactionId: a.data?._id ?? "",
              userId: currentUser?._id ?? "",
              branchId: currentBranch,
              amount: eload.amount! + getFee()!,
            });

            if (success ?? false) {
              (data as any).transactionId = a.data;
              dispatch(newLog({ key: "cash", log: data as Log }));
            }
          }

          setSelectedUser(null);
          _setSelectedUser(null);
          updateCredit("isCredit", false);

          close();
        }
      })();
    });
  };

  const getFee = () => {
    if (disabledEload?.additionalFee) {
      const { threshold, additionalFee, fee } = disabledEload;

      if ((eload.amount ?? 0) / (threshold ?? 1) > 0) {
        let multiplier = Math.floor((eload.amount ?? 0) / (threshold ?? 1));
        return (fee ?? 0) + additionalFee * multiplier;
      } else return fee;
    }
    return 0;
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
    (async (_) => {
      let res2 = await _.getEloadSettings();
      if (res2?.success ?? false) setDisabledEload(res2?.data ?? null);
    })(EtcService);
  }, []);

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          setEload({
            provider: null,
            phone: null,
            amount: null,
            type: "regular",
            promo: null,
          });
          updateCredit("isCredit", false);
          setSelectedUser(null);
          close();
        }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography.Title level={2}>Load</Typography.Title>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                if ((eload.amount ?? 0) > 0) {
                  if (!credit.isCredit) {
                    updateCredit("isCredit", true);
                    setOpenCredit(true);
                  } else {
                    updateCredit("isCredit", false);
                    setSelectedUser(null);
                    _setSelectedUser(null);
                  }
                } else {
                  message.warning(
                    "Cannot proceed to credit if amount is empty."
                  );
                }
              }}
            >
              <Checkbox checked={credit.isCredit} />
              <span
                style={{
                  fontSize: "1em",
                  marginLeft: 10,
                }}
              >
                Apply Credit
              </span>
            </div>
          </div>
        }
        closable={false}
        footer={null}
        destroyOnClose
      >
        <Select
          className="customSelect"
          placeholder="Provider"
          size="large"
          style={{
            display: "block",
            height: 70,
            marginBottom: 10,
            fontSize: "2em",
          }}
          options={jason.provider.map((e) => ({
            label: `${e} ${
              disabledEload?.disabled_eload.includes(e) ? "(disabled)" : ""
            }`,
            value: e,
            disabled: disabledEload?.disabled_eload.includes(e),
          }))}
          onChange={(e) => update("provider", e)}
        />

        <Input
          size="large"
          onChange={(e) => update("phone", e.target.value)}
          maxLength={10}
          minLength={10}
          prefix="+63"
          placeholder="10 Digit Number (9******)"
          className="customInput size-70"
          style={{
            height: 70,
            fontSize: "2em",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        />

        {/* <span
        style={{
          marginBottom: 10,
          float: "right",
          fontSize: "1.35em",
        }}
      >
        {checkProvider(eload.phone ?? "")}
      </span> */}

        <FloatLabel
          value={eload.amount?.toString()}
          label="Amount"
          style={{
            marginTop: 10,
          }}
          extra={
            <span
              style={{
                float: "right",
                marginBottom: 10,
                fontSize: "1.8em",
              }}
            >
              +₱{getFee()} (fee)
            </span>
          }
        >
          <InputNumber
            size="large"
            className="customInput size-70"
            style={{
              width: "100%",
              height: 70,
              alignItems: "center",
              fontSize: "2em",
            }}
            prefix="₱"
            min={1}
            onChange={(e) => update("amount", e)}
            controls={false}
            formatter={(value: any) =>
              value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </FloatLabel>
        <Radio.Group
          onChange={(e) => update("type", e.target.value)}
          className="custom-radio"
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
              className="customInput size-70"
              size="large"
              value={eload.promo ?? ""}
              onChange={(e) => update("promo", e.target.value)}
              styles={{
                textarea: {
                  fontSize: "1.5em",
                },
              }}
              autoSize={{
                minRows: 2,
              }}
            />
          </FloatLabel>
        )}
        {selectedUser != null && showCreditForm()}
        <Button
          block
          size="large"
          type="primary"
          onClick={handleRequest}
          style={{
            height: 70,
            fontSize: "2em",
            marginTop: 25,
          }}
        >
          CONFIRM
        </Button>
      </Modal>

      {/* context */}
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
              runTimer(e);
            } else setSelectedUser(null);
          }}
          onSelect={(_, __) => {
            if (
              users.filter((e) => e._id == __.key)[0].availableCredit -
                eload.amount! +
                getFee()! >
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

export default Eload;
