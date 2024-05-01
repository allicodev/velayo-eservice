import Loader from "./utils/loader";
import Api from "./api.service";
import {
  BillingSettingsType,
  Transaction,
  UpdateBillWallet,
  Wallet,
} from "@/types";

class EtcService extends Loader {
  private readonly instance = new Api();

  public async disableWalletBills(
    bills: BillingSettingsType[],
    wallets: Wallet[]
  ) {
    let _bills: UpdateBillWallet[] = [];
    let _wallets: UpdateBillWallet[] = [];

    bills.forEach((e) => {
      if (e)
        _bills.push({ id: e._id ?? "", isDisabled: e.isDisabled ?? false });
    });

    wallets.forEach((e, i) => {
      if (e)
        _wallets.push({ id: e._id ?? "", isDisabled: e.isDisabled ?? false });
    });
    this.loaderPush("update-wallet-bill");
    const response = await this.instance.post<Response>({
      endpoint: "/etc/update-bill-wallet",
      payload: {
        wallets: _wallets,
        bills: _bills,
      },
    });
    this.loaderPop("update-wallet-bill");

    return response;
  }

  public async checkIfDisabled(type: string, id: string) {
    this.loaderPush("check-disabled");
    const response = await this.instance.get<Response>({
      endpoint: "/etc/check-disabled",
      query: {
        type,
        id,
      },
    });
    this.loaderPop("check-disabled");
    return response;
  }

  public async getTransactionFromTraceId(traceId: string) {
    this.loaderPush("get-trans");
    const response = await this.instance.get<Transaction>({
      endpoint: "/transaction/search-transaction",
      query: {
        traceId,
      },
    });
    this.loaderPop("get-trans");
    return response;
  }
}

export default EtcService;
