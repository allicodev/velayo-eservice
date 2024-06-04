import { BalanceRequest, NewPortalProps, Portal, Response } from "@/types";
import Api from "./api.service";

class PortalService {
  private readonly instance = new Api();

  public async newPortal(payload: NewPortalProps) {
    return await this.instance.post<Response>({ endpoint: "/portal", payload });
  }

  public async getPortal(query?: any) {
    if (query?.assignTo) query.assignTo = JSON.stringify(query.assignTo);
    if (query?.project) query.project = JSON.stringify(query.project);
    return await this.instance.get<Portal[]>({ endpoint: "/portal", query });
  }

  public async deletePortal(_id: string) {
    return await this.instance.get<Response>({
      endpoint: "/portal/delete",
      query: { _id },
    });
  }

  public async requestBalance(
    amount: number,
    portalId: string,
    encoderId: string
  ) {
    return await this.instance.post<Response>({
      endpoint: "/portal/balance",
      payload: { amount, portalId, encoderId, type: "balance_request" },
    });
  }

  public async getBalanceRequest(query?: any) {
    return await this.instance.get<BalanceRequest[]>({
      endpoint: "/portal/balance",
      query,
    });
  }

  public async updateBalanceRequest(_id: string, payload: any) {
    return await this.instance.post<BalanceRequest>({
      endpoint: "/portal/balance",
      payload: { ...payload, _id },
    });
  }
}

export default PortalService;
