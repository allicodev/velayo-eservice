import API from "./api.service";
import {
  BillingSettingsType,
  BillingsFormField,
  Transaction,
  Response,
  UpdateFeeProps,
  TransactionHistoryStatus,
  OnlinePayment,
  TransactionType,
  ExceptionItemProps,
} from "@/types";
import { Dayjs } from "dayjs";

abstract class BillService {
  public static async getBill(_id?: string | null) {
    return await API.get<BillingSettingsType[]>({
      endpoint: "/bill/get-bill",
      query: { _id },
    });
  }

  public static async newBill(name: string) {
    return await API.post<BillingSettingsType>({
      endpoint: "/bill/new-bill",
      payload: {
        name,
      },
    });
  }

  public static async pushToFormFields(
    billId: string,
    formfield: BillingsFormField
  ) {
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    return await API.post<BillingSettingsType>({
      endpoint: "/bill/new-option",
      payload: {
        id: billId,
        formField: formfield,
      },
    });
  }

  public static async updateFormFields(
    billId: string,
    formfield: BillingsFormField,
    index: number
  ) {
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();

    return await API.post<BillingSettingsType>({
      endpoint: "/bill/update-option",
      payload: {
        id: billId,
        formField: formfield,
        index,
      },
    });
  }

  public static async updateBillOption(
    billId: string,
    billOption: BillingSettingsType
  ) {
    return await API.post<BillingSettingsType>({
      endpoint: "/bill/update-bill-option",
      payload: {
        id: billId,
        billOption,
      },
    });
  }

  public static async removeOptionIndexed(billId: string, index: number) {
    return await API.get<BillingSettingsType>({
      endpoint: "/bill/delete-option",
      query: {
        id: billId,
        index,
      },
    });
  }

  public static async updateBillName(billId: string, name: string) {
    return await API.get<BillingSettingsType>({
      endpoint: "/bill/update-bill",
      query: {
        id: billId,
        name,
      },
    });
  }

  public static async requestBill(
    biller_name: string,
    bill: string,
    amount: number,
    fee: number,
    tellerId: string,
    branchId: string,
    online?: OnlinePayment,
    billerId?: string
  ) {
    let transaction: Transaction = {
      type: "bills",
      sub_type: biller_name,
      transactionDetails: bill,
      fee,
      amount,
      tellerId,
      branchId,
      billerId,
      ...(online ? online : {}),
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
          createdAt: new Date(),
        },
      ],
    };

    return await API.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
  }

  public static async getAllTransaction({
    page,
    pageSize,
    status,
    order,
    fromDate,
    toDate,
    tellerId,
    encoderId,
    branchId,
    type,
    sub_type,
    project,
  }: {
    page: number;
    pageSize: number;
    status?: TransactionHistoryStatus[] | null;
    order?: "descending" | "ascending";
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
    tellerId?: string;
    encoderId?: string;
    branchId?: string;
    type?: TransactionType | null;
    sub_type?: string | null;
    project?: Record<any, any>;
  }) {
    return await API.get<Transaction[]>({
      endpoint: "/transaction/get-transactions",
      query: {
        page,
        pageSize,
        status: JSON.stringify(status),
        order,
        fromDate,
        toDate,
        tellerId,
        encoderId,
        branchId,
        type,
        sub_type,
        project: JSON.stringify(project),
      },
    });
  }

  public static async updateTransaction(transaction: any) {
    return await API.post<Response>({
      endpoint: "/transaction/update-transaction",
      payload: transaction,
    });
  }

  public static async updateTransactionSpecific(transaction: any) {
    return await API.post<Response>({
      endpoint: "/transaction/update-transaction-specific",
      payload: transaction,
    });
  }

  public static async markMainAmount(billId: string, index: number) {
    return await API.post<BillingSettingsType>({
      endpoint: "/bill/mark-as-main",
      payload: {
        id: billId,
        index,
      },
    });
  }

  public static async updateFee(fee: UpdateFeeProps) {
    return await API.get<BillingSettingsType>({
      endpoint: "/bill/update-fee",
      query: fee,
    });
  }

  public static async requestEload(eload: any, branchId: string) {
    const amount = eload.amount;
    eload.amount = `${amount}_money`;
    const provider = eload.provider;

    delete eload.provider;

    let transaction: Transaction = {
      type: "eload",
      sub_type: `${provider} LOAD` ?? "",
      transactionDetails: JSON.stringify(eload),
      amount,
      fee: eload.fee,
      tellerId: eload.tellerId,
      branchId,
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
          createdAt: new Date(),
        },
      ],
    };

    return await API.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
  }

  public static async requestShoppeCollect(
    details: string,
    amount: number | null,
    tellerId: string,
    branchId: string
  ) {
    let transaction: Transaction = {
      type: "shopee",
      sub_type: "shopee self collect",
      transactionDetails: details,
      ...(amount != null ? { amount } : { amount: 0 }),
      fee: 0,
      tellerId,
      branchId,
      history: [
        {
          description: "Transaction Completed",
          status: "completed",
          createdAt: new Date(),
        },
      ],
    };

    return await API.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
  }

  public static async deleteBiller(_id: string): Promise<Response> {
    return await API.get<Response>({
      endpoint: "/bill/delete-biller",
      query: { _id },
    });
  }

  public static async updateExceptionBiller(
    _id: string,
    direction: string,
    excludeItems: ExceptionItemProps[]
  ): Promise<Response> {
    return await API.post<Response>({
      endpoint: "/bill/update-exception",
      payload: { _id, direction, excludeItems },
    });
  }
}

export default BillService;
