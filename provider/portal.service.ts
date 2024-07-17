import { BalanceRequest, NewPortalProps, Portal, Response } from "@/types";
import API from "./api.service";

abstract class PortalService {
  public static async newPortal(payload: NewPortalProps) {
    return await API.post<Response>({ endpoint: "/portal", payload });
  }

  public static async getPortal(query?: any) {
    if (query?.assignTo) query.assignTo = JSON.stringify(query.assignTo);
    if (query?.project) query.project = JSON.stringify(query.project);
    return await API.get<Portal[]>({ endpoint: "portal", query });
  }

  public static async deletePortal(_id: string) {
    return await API.get<Response>({
      endpoint: "/portal/delete",
      query: { _id },
    });
  }

  public static async requestBalance(
    amount: number,
    portalId: string,
    encoderId: string
  ) {
    return await API.post<Response>({
      endpoint: "/portal/balance",
      payload: { amount, portalId, encoderId, type: "balance_request" },
    });
  }

  public static async getBalanceRequest(query?: any) {
    return await API.get<BalanceRequest[]>({
      endpoint: "/portal/balance",
      query,
    });
  }

  public static async updateBalanceRequest(_id: string, payload: any) {
    return await API.post<BalanceRequest>({
      endpoint: "/portal/balance",
      payload: { ...payload, _id },
    });
  }
}

export default PortalService;
