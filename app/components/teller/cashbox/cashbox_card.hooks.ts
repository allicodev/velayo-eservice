import { RootState } from "@/app/state/store";
import { Log, TellerState } from "@/types";
import { useSelector } from "react-redux";

const useCashBoxCard = () => {
  const [reduxTeller, reduxLogs]: [TellerState, Log[]] = useSelector(
    (state: RootState) => [state.teller, state.logs.cash]
  );
  const getCurrentBalance = () =>
    reduxTeller?.balance +
    reduxLogs.reduce((p: any, n: any) => p + (n.amount ?? 0), 0);

  return { currentBalance: getCurrentBalance() };
};

export default useCashBoxCard;
