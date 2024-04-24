import Loader from "./utils/loader";
import Api from "./api.service";
import { Branch, BranchData, ExtendedResponse, Response } from "@/types";

class BranchService extends Loader {
  private readonly instance = new Api();

  public async newBranch({ ...props }: Branch): Promise<Response> {
    this.loaderPush("new-branch");
    const response = await this.instance.post<Branch>({
      endpoint: "/branch",
      payload: props,
    });
    this.loaderPop("new-branch");
    return response;
  }

  public async getBranch({
    _id,
  }: {
    _id?: string;
  }): Promise<ExtendedResponse<BranchData[]>> {
    this.loaderPush("get-branches");
    const response = await this.instance.get<BranchData[]>({
      endpoint: "/branch",
      query: { _id },
    });
    this.loaderPop("get-branches");
    return response;
  }

  public async updateBranch({ ...props }: BranchData) {
    this.loaderPush("update-branch");
    const response = await this.instance.post<Response>({
      endpoint: "/branch",
      payload: props,
    });
    this.loaderPop("update-branch");
    return response;
  }

  public async getBranchSpecific(
    _id: string
  ): Promise<ExtendedResponse<BranchData>> {
    this.loaderPush("update-branch");
    const response = await this.instance.get<BranchData>({
      endpoint: "/branch/get-branch",
      query: { _id },
    });
    this.loaderPop("update-branch");
    return response;
  }
}

export default BranchService;
