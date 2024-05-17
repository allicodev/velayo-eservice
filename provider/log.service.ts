import Loader from "./utils/loader";
import Api from "./api.service";
import { ExtendedResponse, LogData, NewLog, Response } from "@/types";

class LogService extends Loader {
  private readonly instance = new Api();

  public async newLog({ ...props }: NewLog): Promise<Response> {
    this.loaderPush("new-log");
    const response = await this.instance.post<Response>({
      endpoint: "/log",
      payload: {
        postType: "new",
        ...props,
      },
    });
    this.loaderPop("new-log");
    return response;
  }

  public async updateLog({ ...props }: { [key: string]: any }) {
    const response = await this.instance.post<Response>({
      endpoint: "/log",
      payload: {
        postType: "update",
        ...props,
      },
    });
    return response;
  }

  public async getLog(props: any): Promise<ExtendedResponse<LogData[]>> {
    const response = await this.instance.get<LogData[]>({
      endpoint: "/log",
      query: props,
    });
    return response;
  }
}

export default LogService;
