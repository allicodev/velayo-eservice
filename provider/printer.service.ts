import axios from "axios";
import Loader from "./utils/loader";
import {
  ShopeeSelfCollectPrinter,
  Transaction,
  TransactionPrinter,
  TransactionPrinterPOS,
  Response,
  ExtendedResponse,
} from "@/types";

class PrinterService extends Loader {
  private readonly instance = axios.create({
    baseURL: "http://localhost:3001",
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
  public async printShoppeCollect({ ...p }: ShopeeSelfCollectPrinter) {
    this.loaderPush("send-collect");
    const response = await this.instance.post("/print/shopee-collect", p);
    this.loaderPop("send-collect");
    return response;
  }

  public async printReceipt({
    printData,
    tellerId,
    branchId,
  }: {
    printData: TransactionPrinter;
    tellerId: string;
    branchId: string;
  }) {
    this.loaderPush("printing-receipt");
    const response = await this.instance.post("/print/receipt", {
      ...printData,
      tellerId,
      branchId,
    });
    this.loaderPop("printing-receipt");
    return response;
  }

  public async printReceiptPos({
    printData,
    tellerId,
    branchId,
  }: {
    printData: TransactionPrinterPOS;
    tellerId: string;
    branchId: string;
  }) {
    this.loaderPush("printing-receipt");
    const response = await this.instance.post("/print/receipt-pos", {
      ...printData,
      tellerId,
      branchId,
    });
    this.loaderPop("printing-receipt");
    return response;
  }
}

export default PrinterService;
