import { useState } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import _ from "lodash";

import { ManualCashBoxUpdateProp } from "../cashbox/cashbox.types";
import { useUserStore } from "@/provider/context";
import { AppDispatch } from "@/app/state/store";
import { updateBalance } from "@/app/state/teller.reducer";
import LogService from "@/provider/log.service";
import { newLog } from "@/app/state/logs.reducers";
import { Log } from "@/types";

export interface MyProps {
  open: boolean;
  close: () => void;
}

const usebalanceInit = (props: MyProps) => {
  const { close } = props;
  const { currentUser, currentBranch } = useUserStore();

  const [manualCashOpt, setManualCashOpt] = useState<ManualCashBoxUpdateProp>({
    cash: null,
    reason: null,
    cashFrom: null,
  });

  const dispatch = useDispatch<AppDispatch>();

  const onManualCashUpdate = (key: string, value: any) =>
    setManualCashOpt({ ...manualCashOpt, [key]: value });

  const handleOnSubmitBalance = async () => {
    const balance = manualCashOpt.cash ?? 0;

    let {
      success,
      data,
      message: apiMessage,
    } = await LogService.newLog({
      type: "disbursement",
      subType: "manual",
      userId: currentUser?._id ?? "",
      branchId: currentBranch,
      amount: balance,
      attributes: JSON.stringify({
        remarks: manualCashOpt.reason,
        cash_from: manualCashOpt.cashFrom,
        is_initial_balance: true,
      }),
    });

    if (success ?? false) {
      dispatch(
        newLog({
          key: "cash",
          log: data as Log,
        })
      );

      message.success("Successfully Set the cashbox balance for today");
      close();
    } else message.error(apiMessage ?? "There is an error in the Server");
  };

  const checkValidation = () => {
    return _.every(manualCashOpt, (val) => {
      return (
        !_.isNil(val) &&
        ((_.isNumber(val) && val > 0) ||
          (_.isString(val) && !_.isEmpty(_.trim(val))))
      );
    });
  };

  return {
    ...props,
    manualCashOpt,
    onManualCashUpdate,
    handleOnSubmitBalance,
    checkValidation,
  };
};

export default usebalanceInit;
