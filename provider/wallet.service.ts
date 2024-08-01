import API from "./api.service";
import {
  BillingsFormField,
  ExtendedResponse,
  Transaction,
  Wallet,
  WalletType,
  Response,
  ExceptionItemProps,
} from "@/types";

abstract class WalletService {
  public static async getWallet(_id?: string | null) {
    return await API.get<Wallet[]>({
      endpoint: "/wallet/get-wallet",
      query: { _id },
    });
  }

  public static async newWallet(
    payload: Wallet
  ): Promise<ExtendedResponse<Wallet>> {
    return await API.post<Wallet>({
      endpoint: "/wallet/new-wallet",
      payload,
    });
  }

  public static async updateWalletFee(
    payload: Wallet
  ): Promise<ExtendedResponse<Wallet>> {
    if (payload.cashinFeeValue == null) payload.cashinFeeValue = 0;
    if (payload.cashoutFeeValue == null) payload.cashoutFeeValue = 0;

    return await API.post<Wallet>({
      endpoint: "/wallet/update-wallet-option",
      payload: {
        id: payload._id,
        walletOption: payload,
      },
    });
  }

  public static async updateName(
    id: string,
    name: string
  ): Promise<ExtendedResponse<Wallet>> {
    return await API.post<Wallet>({
      endpoint: "/wallet/update-name",
      payload: {
        id,
        name,
      },
    });
  }

  public static async pushToFormFields(
    billId: string,
    formfield: BillingsFormField,
    type: WalletType
  ) {
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    return await API.post<Wallet>({
      endpoint: "/wallet/new-option",
      payload: {
        id: billId,
        formField: formfield,
        type,
      },
    });
  }

  public static async updateWalletFormFields(
    billId: string,
    formfield: BillingsFormField,
    index: number,
    type: WalletType
  ) {
    formfield.slug_name = formfield.name
      .replaceAll(" ", "_")
      .toLocaleLowerCase();
    return await API.post<Wallet>({
      endpoint: "/wallet/update-wallet",
      payload: {
        id: billId,
        formField: formfield,
        index,
        type,
      },
    });
  }

  public static async updateWalletOption(
    walletId: string,
    walletOption: Wallet
  ) {
    return await API.post<Wallet>({
      endpoint: "/wallet/update-wallet-option",
      payload: {
        id: walletId,
        walletOption,
      },
    });
  }

  public static async markWalletMainAmount(
    billId: string,
    index: number,
    type: WalletType
  ) {
    return await API.post<Wallet>({
      endpoint: "/wallet/mark-as-main",
      payload: {
        id: billId,
        index,
        type,
      },
    });
  }

  public static async removeWalletOptionIndexed(
    billId: string,
    index: number,
    type: WalletType
  ) {
    return await API.get<Wallet>({
      endpoint: "/wallet/delete-wallet-option",
      query: {
        id: billId,
        index,
        type,
      },
    });
  }

  public static async requestWalletTransaction(
    biller_name: string,
    bill: string,
    amount: number,
    fee: number,
    tellerId: string,
    branchId: string,
    traceId: string | null,
    walletId?: string | null,
    creditId?: string | null
  ) {
    let transaction: Transaction = {
      type: "wallet",
      sub_type: biller_name,
      transactionDetails: bill,
      amount,
      fee,
      tellerId,
      branchId,
      walletId,
      creditId,
      history: [
        {
          description: "First  Transaction requested",
          status: "pending",
          createdAt: new Date(),
        },
      ],
    };

    if (traceId) transaction.traceId = traceId;

    return await API.post<Transaction>({
      endpoint: "/bill/request-transaction",
      payload: { ...transaction, branchId },
    });
  }

  public static async deleteWallet(_id: string): Promise<Response> {
    return await API.get<Response>({
      endpoint: "/wallet/delete-wallet",
      query: { _id },
    });
  }

  public static async updateExceptionWallet(
    _id: string,
    direction: string,
    type: string,
    excludeItems: ExceptionItemProps[]
  ): Promise<Response> {
    return await API.post<Response>({
      endpoint: "/wallet/update-exception",
      payload: { _id, direction, excludeItems, type },
    });
  }
}

export default WalletService;
