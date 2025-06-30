import API from "./api.service";
import { Response, ThresholdFees } from "@/types";

abstract class FeeService {
  public static async getFeeThreshold(
    type: "bills" | "wallet",
    link_id: string,
    additionalFilter?: Object
  ) {
    return await API.get<ThresholdFees[]>({
      endpoint: "/fee",
      query: {
        type,
        link_id,
        ...additionalFilter,
      },
    });
  }
}

export default FeeService;
