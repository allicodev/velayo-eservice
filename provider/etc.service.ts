import Api from "./api.service";
import {
  BillingSettingsType,
  EloadSettings,
  Notification,
  Response,
  Transaction,
  UpdateBillWallet,
  Wallet,
} from "@/types";

class EtcService {
  private readonly instance = new Api();

  public async disableWalletBills(
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
    return await this.instance.post<Response>({
      endpoint: "/etc/update-bill-wallet",
      payload: {
        wallets: _wallets,
        bills: _bills,
      },
    });
  }

  public async checkIfDisabled(type: string, id: string) {
    return await this.instance.get<Response>({
      endpoint: "/etc/check-disabled",
      query: {
        type,
        id,
      },
    });
  }

  public async getTransactionFromTraceId(traceId: string) {
    return await this.instance.get<Transaction>({
      endpoint: "/transaction/search-transaction",
      query: {
        traceId,
      },
    });
  }

  public async newNotif(payload: Notification) {
    return await this.instance.post({
      endpoint: "/notification",
      payload,
    });
  }

  public async getNotif(query: any) {
    return await this.instance.get<Notification[]>({
      endpoint: "/notification",
      query,
    });
  }

  public async seenNotif(id: string) {
    return await this.instance.get<Response>({
      endpoint: "/notification/read",
      query: { _id: id },
    });
  }

  public async checkSettings() {
    return await this.instance.get<Response>({
      endpoint: "/etc/check-settings",
    });
  }

  public async getEloadSettings() {
    return await this.instance.get<EloadSettings>({
      endpoint: "/etc/eload-settings",
    });
  }

  public async updateEloadSettings(settings: string[]) {
    return await this.instance.post<Response>({
      endpoint: "/etc/eload-settings-update",
      payload: { settings },
    });
  }
}

export default EtcService;
