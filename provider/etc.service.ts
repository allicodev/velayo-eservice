import API from "./api.service";
import {
  BillingSettingsType,
  EloadSettings,
  RequestQueue,
  Response,
  Transaction,
  UpdateBillWallet,
  Wallet,
} from "@/types";

abstract class EtcService {
  public static async disableWalletBills(
    bills: BillingSettingsType[],
    wallets: Wallet[]
  ) {
    let _bills: UpdateBillWallet[] = [];
    let _wallets: UpdateBillWallet[] = [];

    bills.forEach((e) => {
      if (e)
        _bills.push({
          id: e._id ?? "",
          isDisabled: e.isDisabled ?? false,
          name: e.name,
        });
    });

    wallets.forEach((e, i) => {
      if (e)
        _wallets.push({
          id: e._id ?? "",
          isDisabled: e.isDisabled ?? false,
          name: e.name,
        });
    });
    return await API.post<Response>({
      endpoint: "etc/update-bill-wallet",
      payload: {
        wallets: _wallets,
        bills: _bills,
      },
    });
  }

  public static async checkIfDisabled(type: string, id: string) {
    return await API.get<Response>({
      endpoint: "etc/check-disabled",
      query: {
        type,
        id,
      },
    });
  }

  public static async getTransactionFromTraceId(traceId: string) {
    return await API.get<Transaction>({
      endpoint: "transaction/search-transaction",
      query: {
        traceId,
      },
    });
  }

  public static async checkSettings() {
    return await API.get<Response>({
      endpoint: "etc/check-settings",
    });
  }

  public static async getEloadSettings() {
    return await API.get<EloadSettings>({
      endpoint: "etc/eload-settings",
    });
  }

  public static async updateEloadSettings(payload: any) {
    return await API.post<Response>({
      endpoint: "etc/eload-settings-update",
      payload,
    });
  }

  public static async getLastQueue(branchId: string) {
    return await API.get<number>({
      endpoint: "etc/check-last-queue",
      query: {
        branchId,
      },
    });
  }

  public static async getQueueRequest(branchId: string, queue?: number) {
    return await API.get<RequestQueue[]>({
      endpoint: "etc/requests-queue",
      query: {
        branchId,
        queue,
      },
    });
  }

  public static async markCompleted(_id: string) {
    return await API.get<RequestQueue[]>({
      endpoint: "etc/request-completed",
      query: {
        _id,
      },
    });
  }
}

export default EtcService;
