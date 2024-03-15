import Loader from "./utils/loader";
import Api from "./api.service";
import { ExtendedResponse, Wallet } from "@/types";

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

  public async updateWallet(
    payload: Wallet
  ): Promise<ExtendedResponse<Wallet>> {
    this.loaderPush("update-wallet");
    const response = await this.instance.post<Wallet>({
      endpoint: "/wallet/update-wallet",
      payload,
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
}

export default WalletService;
