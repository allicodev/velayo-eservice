import Loader from "./utils/loader";
import Api from "./api.service";
import {
  Branch,
  BranchData,
  BranchItemUpdate,
  ExtendedResponse,
  Response,
} from "@/types";

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
    return await this.instance.get<BranchData>({
      endpoint: "/branch/get-branch",
      query: { _id },
    });
  }

  public async newItemBranch(_id: string, itemIds: string[]) {
    return await this.instance.post<BranchData>({
      endpoint: "/branch/new-item",
      payload: { _id, itemIds },
    });
  }

  public async updateItemBranch(
    _id: string,
    type: string,
    items: BranchItemUpdate[],
    transactId?: string
  ) {
    return await this.instance.post<BranchData>({
      endpoint: "/branch/update-items",
      payload: { _id, items, type, transactId },
    });
  }

  public async getItemSpecific(branchId: string, itemId: string) {
    let branch = await this.instance.get<BranchData>({
      endpoint: "/branch/get-item-specific",
      query: { branchId },
    });

    return branch.data?.items?.filter((e) => e.itemId._id == itemId);
  }
  public async removeBranchItem(branchId: string, itemId: string) {
    return await this.instance.get<Response>({
      endpoint: "/branch/remove-item",
      query: { branchId, itemId },
    });
  }
}

export default BranchService;
