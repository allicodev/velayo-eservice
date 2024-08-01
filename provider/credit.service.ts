import { UserCredit, UserCreditData } from "@/types";
import API from "./api.service";

abstract class CreditService {
  public static async getUser({
    _id,
    searchWord,
  }: {
    _id?: string;
    searchWord?: string;
  }) {
    return API.get<UserCreditData[]>({
      endpoint: "/credit",
      query: {
        _id,
        searchWord,
      },
    });
  }

  public static async newCreditUser(creditUser: UserCredit) {
    return API.post({ endpoint: "/credit", payload: creditUser });
  }
}

export default CreditService;
