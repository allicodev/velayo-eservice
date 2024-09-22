import { RootState } from "@/app/state/store";
import { useSelector } from "react-redux";

const useCashBoxCard = () => {
  const reduxLogs = useSelector((state: RootState) => state.logs);
  const getCurrentBalance = () =>
    (reduxLogs.cash || []).reduce((p: any, n: any) => p + (n.amount ?? 0), 0);

  return { currentBalance: getCurrentBalance() };
};

export default useCashBoxCard;
