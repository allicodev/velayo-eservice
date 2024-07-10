import axios from "axios";
import Loader from "./utils/loader";
import {
  ShopeeSelfCollectPrinter,
  TransactionPrinter,
  TransactionPrinterPOS,
} from "@/types";

abstract class PrinterService extends Loader {
  private static readonly instance = axios.create({
    baseURL: "http://localhost:3001",
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
  public static async printShoppeCollect({ ...p }: ShopeeSelfCollectPrinter) {
    return await this.instance.post("/print/shopee-collect", p);
  }

  public static async printReceipt({
    printData,
    tellerId,
    branchId,
  }: {
    printData: TransactionPrinter;
    tellerId: string;
    branchId: string;
  }) {
    return await this.instance.post("/print/receipt", {
      ...printData,
      tellerId,
      branchId,
    });
  }

  public static async printReceiptPos({
    printData,
    tellerId,
    branchId,
  }: {
    printData: TransactionPrinterPOS;
    tellerId: string;
    branchId: string;
  }) {
    return await this.instance.post("/print/receipt-pos", {
      ...printData,
      tellerId,
      branchId,
    });
  }
}

export default PrinterService;
