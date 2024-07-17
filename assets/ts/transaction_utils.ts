import BillService from "@/provider/bill.service";
import WalletService from "@/provider/wallet.service";
import { Transaction, TransactionPrinter } from "@/types";

// Transaction Viewer using Receipt No (last 8 of _id parseInt to hexa value)

export const transactionToPrinter = async (
  transaction: Transaction
): Promise<TransactionPrinter> => {
  let res: any;

  if (transaction.type == "wallet")
    res = await WalletService.getWallet(transaction?.walletId ?? "");
  else res = await BillService.getBill(transaction?.billerId ?? "");
  res = res.data && res.data.length > 0 ? res.data[0] : null;

  if (res) {
    let otherDetails = JSON.parse(transaction.transactionDetails);
    const excludeForm =
      transaction.type == "wallet"
        ? transaction.sub_type?.includes("cash-in")
          ? res.cashInexceptFormField
          : res.cashOutexceptFormField
        : res.exceptFormField;

    excludeForm.map((e: any) => delete otherDetails[e.name]);

    return {
      type: transaction.type,
      billerName: transaction.sub_type ?? "",
      receiptNo:
        `3772-${parseInt(transaction._id!.slice(-8).toString(), 16)}` ?? "", // should be unique
      refNo: transaction.reference ?? "",
      fee: transaction.fee ?? 0,
      amount: transaction.amount ?? 0,
      otherDetails: JSON.stringify(otherDetails),
    };
  } else {
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
  }
};
