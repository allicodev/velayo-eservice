import Loader from "./utils/loader";
import Api from "./api.service";
import {
  BillingSettingsType,
  BillingsFormField,
  Transaction,
  Response,
  UpdateFeeProps,
  TransactionHistoryStatus,
} from "@/types";

class BillService extends Loader {
  private readonly instance = new Api();

  public async getBill() {
    this.loaderPush("get-bill");
    const response = await this.instance.get<BillingSettingsType[]>({
      endpoint: "/bill/get-bill",
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
    fee: number
  ) {
    let transaction: Transaction = {
      type: "bills",
      sub_type: biller_name,
      transactionDetails: bill,
      fee,
      amount,
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
        },
      ],
    };

    this.loaderPush("request-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: transaction,
    });
    this.loaderPop("request-bill");
    return response;
  }

  public async getAllTransaction(
    page: number,
    pageSize: number,
    status?: TransactionHistoryStatus | null
  ) {
    this.loaderPush("get-transaction");
    const response = await this.instance.get<Transaction[]>({
      endpoint: "/transaction/get-transactions",
      query: {
        page,
        pageSize,
        status,
      },
    });
    this.loaderPop("get-transaction");
    return response;
  }

  public async updateTransaction(transaction: Transaction) {
    this.loaderPush("get-transaction");
    const response = await this.instance.post<Response>({
      endpoint: "/transaction/update-transaction",
      payload: transaction,
    });
    this.loaderPop("get-transaction");
    return response;
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

  public async requestEload(eload: any) {
    const amount = eload.amount;
    eload.amount = `${amount}_money`;
    const provider = eload.provider;

    delete eload.provider;

    let transaction: Transaction = {
      type: "eload",
      sub_type: `${provider} LOAD` ?? "",
      transactionDetails: JSON.stringify(eload),
      amount,
      fee: 2,
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
        },
      ],
    };

    this.loaderPush("request-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: transaction,
    });
    this.loaderPop("request-bill");
    return response;
  }

  public async requestShoppeCollect(details: string, amount: number | null) {
    let transaction: Transaction = {
      type: "shopee",
      sub_type: "shopee self collect",
      transactionDetails: details,
      ...(amount != null ? { amount } : { amount: 0 }),
      fee: 0,
      history: [
        {
          description: "Transaction Completed",
          status: "completed",
        },
      ],
    };

    this.loaderPush("request-shoppe");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: transaction,
    });
    this.loaderPop("request-shoppe");
    return response;
  }
}

export default BillService;
