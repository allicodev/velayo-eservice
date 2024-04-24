import Loader from "./utils/loader";
import Api from "./api.service";
import { ExtendedResponse, LogData, Response } from "@/types";

class LogService extends Loader {
  private readonly instance = new Api();

  public async newLog(userId: string, branchId: string): Promise<Response> {
    this.loaderPush("new-log");
    const response = await this.instance.post<Response>({
      endpoint: "/log",
      payload: {
        userId,
        branchId,
      },
    });
    this.loaderPop("new-log");
    return response;
  }

  public async getLog(): Promise<ExtendedResponse<LogData[]>> {
    this.loaderPush("get-log");
    const response = await this.instance.get<LogData[]>({
      endpoint: "/log",
    });
    this.loaderPop("get-log");
    return response;
  }
}

export default LogService;
