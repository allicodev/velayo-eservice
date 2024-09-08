import { useSelector } from "react-redux";

const useCashBoxCard = () => {
  const [reduxBranch, reduxLogs] = useSelector((state: any) => [
    state.branch.currentBranch,
    state.logs.cash,
  ]);

  const getCurrentBalance = () =>
    reduxBranch?.balance +
    reduxLogs.reduce((p: any, n: any) => p + (n.amount ?? 0), 0);

  return { currentBalance: getCurrentBalance() };
};

export default useCashBoxCard;
