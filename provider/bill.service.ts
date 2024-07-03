import Loader from "./utils/loader";
import Api from "./api.service";
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

class BillService extends Loader {
  private readonly instance = new Api();

  public async getBill(_id?: string | null) {
    this.loaderPush("get-bill");
    const response = await this.instance.get<BillingSettingsType[]>({
      endpoint: "/bill/get-bill",
      query: { _id },
    });
    this.loaderPop("get-bill");
    return response;
  }

  public async newBill(name: string) {
    this.loaderPush("new-bill");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/new-bill",
      payload: {
        name,
      },
    });
    this.loaderPop("new-bill");
    return response;
  }

  public async pushToFormFields(billId: string, formfield: BillingsFormField) {
    this.loaderPush("new-option-bill");
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/new-option",
      payload: {
        id: billId,
        formField: formfield,
      },
    });
    this.loaderPop("new-option-bill");
    return response;
  }

  public async updateFormFields(
    billId: string,
    formfield: BillingsFormField,
    index: number
  ) {
    this.loaderPush("update-option-bill");
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/update-option",
      payload: {
        id: billId,
        formField: formfield,
        index,
      },
    });
    this.loaderPop("update-option-bill");
    return response;
  }

  public async updateBillOption(
    billId: string,
    billOption: BillingSettingsType
  ) {
    this.loaderPush("update-option");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/update-bill-option",
      payload: {
        id: billId,
        billOption,
      },
    });
    this.loaderPop("update-option");
    return response;
  }

  public async removeOptionIndexed(billId: string, index: number) {
    this.loaderPush("removing-option");
    const response = await this.instance.get<BillingSettingsType>({
      endpoint: "/bill/delete-option",
      query: {
        id: billId,
        index,
      },
    });
    this.loaderPop("removing-option");
    return response;
  }

  public async updateBillName(billId: string, name: string) {
    this.loaderPush("removing-option");
    const response = await this.instance.get<BillingSettingsType>({
      endpoint: "/bill/update-bill",
      query: {
        id: billId,
        name,
      },
    });
    this.loaderPop("removing-option");
    return response;
  }

  public async requestBill(
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

    this.loaderPush("request-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
    this.loaderPop("request-bill");
    return response;
  }

  public async getAllTransaction({
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
    return await this.instance.get<Transaction[]>({
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

  public async updateTransaction(transaction: any) {
    return await this.instance.post<Response>({
      endpoint: "/transaction/update-transaction",
      payload: transaction,
    });
  }

  public async updateTransactionSpecific(transaction: any) {
    return await this.instance.post<Response>({
      endpoint: "/transaction/update-transaction-specific",
      payload: transaction,
    });
  }

  public async markMainAmount(billId: string, index: number) {
    this.loaderPush("mark-main");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/mark-as-main",
      payload: {
        id: billId,
        index,
      },
    });
    this.loaderPop("mark-main");
    return response;
  }

  public async updateFee(fee: UpdateFeeProps) {
    this.loaderPush("update-fee");
    const response = await this.instance.get<BillingSettingsType>({
      endpoint: "/bill/update-fee",
      query: fee,
    });
    this.loaderPop("update-fee");
    return response;
  }

  public async requestEload(eload: any, branchId: string) {
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

    this.loaderPush("request-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
    this.loaderPop("request-bill");
    return response;
  }

  public async requestShoppeCollect(
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

    this.loaderPush("request-shoppe");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
    this.loaderPop("request-shoppe");
    return response;
  }

  public async deleteBiller(_id: string): Promise<Response> {
    this.loaderPush("delete-biller");
    const response = await this.instance.get<Response>({
      endpoint: "/bill/delete-biller",
      query: { _id },
    });
    this.loaderPop("delete-biller");
    return response;
  }

  public async updateExceptionBiller(
    _id: string,
    direction: string,
    excludeItems: ExceptionItemProps[]
  ): Promise<Response> {
    this.loaderPush("delete-biller");

    const response = await this.instance.post<Response>({
      endpoint: "/bill/update-exception",
      payload: { _id, direction, excludeItems },
    });
    this.loaderPop("delete-biller");
    return response;
  }
}

export default BillService;
