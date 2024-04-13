import { Transaction, TransactionPrinter } from "@/types";

export const transactionToPrinter = (
  transaction: Transaction
): TransactionPrinter => {
  return {
    type: transaction.type,
    billerName: transaction.sub_type ?? "",
    receiptNo:
      `3772-${parseInt(transaction._id!.slice(-8).toString(), 16)}` ?? "", // should be unique
    refNo: transaction.reference ?? "",
    fee: transaction.fee ?? 0,
    amount: transaction.amount ?? 0,
    otherDetails: transaction.transactionDetails,
  };
};
