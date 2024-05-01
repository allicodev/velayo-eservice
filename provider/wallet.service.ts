import Loader from "./utils/loader";
import Api from "./api.service";
import {
  BillingsFormField,
  ExtendedResponse,
  Transaction,
  Wallet,
  WalletType,
  Response,
} from "@/types";

class WalletService extends Loader {
  private readonly instance = new Api();

  public async getWallet() {
    this.loaderPush("get-wallet");
    const response = await this.instance.get<Wallet[]>({
      endpoint: "/wallet/get-wallet",
    });
    this.loaderPop("get-wallet");
    return response;
  }

  public async newWallet(payload: Wallet): Promise<ExtendedResponse<Wallet>> {
    this.loaderPush("new-wallet");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/new-wallet",
      payload,
    });
    this.loaderPop("new-wallet");
    return response;
  }

  public async updateWalletFee(
    payload: Wallet
  ): Promise<ExtendedResponse<Wallet>> {
    if (payload.cashinFeeValue == null) payload.cashinFeeValue = 0;
    if (payload.cashoutFeeValue == null) payload.cashoutFeeValue = 0;

    this.loaderPush("update-wallet");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/update-wallet-option",
      payload: {
        id: payload._id,
        walletOption: payload,
      },
    });
    this.loaderPop("update-wallet");
    return response;
  }

  public async updateName(
    id: string,
    name: string
  ): Promise<ExtendedResponse<Wallet>> {
    this.loaderPush("update-wallet");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/update-name",
      payload: {
        id,
        name,
      },
    });
    this.loaderPop("update-wallet");
    return response;
  }

  public async pushToFormFields(
    billId: string,
    formfield: BillingsFormField,
    type: WalletType
  ) {
    this.loaderPush("new-option-bill");
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/new-option",
      payload: {
        id: billId,
        formField: formfield,
        type,
      },
    });
    this.loaderPop("new-option-bill");
    return response;
  }

  public async updateWalletFormFields(
    billId: string,
    formfield: BillingsFormField,
    index: number,
    type: WalletType
  ) {
    this.loaderPush("update-option-bill");
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/update-wallet",
      payload: {
        id: billId,
        formField: formfield,
        index,
        type,
      },
    });
    this.loaderPop("update-option-bill");
    return response;
  }

  public async updateWalletOption(walletId: string, walletOption: Wallet) {
    this.loaderPush("update-option");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/update-wallet-option",
      payload: {
        id: walletId,
        walletOption,
      },
    });
    this.loaderPop("update-option");
    return response;
  }

  public async markWalletMainAmount(
    billId: string,
    index: number,
    type: WalletType
  ) {
    this.loaderPush("mark-main");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/mark-as-main",
      payload: {
        id: billId,
        index,
        type,
      },
    });
    this.loaderPop("mark-main");
    return response;
  }

  public async removeWalletOptionIndexed(
    billId: string,
    index: number,
    type: WalletType
  ) {
    this.loaderPush("removing-option");
    const response = await this.instance.get<Wallet>({
      endpoint: "/wallet/delete-wallet-option",
      query: {
        id: billId,
        index,
        type,
      },
    });
    this.loaderPop("removing-option");
    return response;
  }

  public async requestWalletTransaction(
    biller_name: string,
    bill: string,
    amount: number,
    fee: number,
    tellerId: string,
    branchId: string,
    traceId: string | null
  ) {
    let transaction: Transaction = {
      type: "wallet",
      sub_type: biller_name,
      transactionDetails: bill,
      amount,
      fee,
      tellerId,
      branchId,
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
        },
      ],
    };

    if (traceId) transaction.traceId = traceId;

    this.loaderPush("request-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
    this.loaderPop("request-bill");
    return response;
  }

  public async deleteWallet(_id: string): Promise<Response> {
    this.loaderPush("delete-biller");
    const response = await this.instance.get<Response>({
      endpoint: "/wallet/delete-wallet",
      query: { _id },
    });
    this.loaderPop("delete-biller");
    return response;
  }
}

export default WalletService;
