import Loader from "./utils/loader";
import API from "./api.service";
import { ExtendedResponse, Log, LogData, NewLog, Response } from "@/types";

abstract class LogService extends Loader {
  public static async newLog({
    ...props
  }: NewLog): Promise<ExtendedResponse<LogData>> {
    return await API.post<LogData>({
      endpoint: "/log",
      payload: {
        postType: "new",
        ...props,
      },
    });
  }

  public static async updateLog({ ...props }: { [key: string]: any }) {
    return await API.post<Response>({
      endpoint: "/log",
      payload: {
        postType: "update",
        ...props,
      },
    });
  }

  public static async getLog(props: any): Promise<ExtendedResponse<any[]>> {
    return await API.get<any[]>({
      endpoint: "/log",
      query: props,
    });
  }
}

export default LogService;
