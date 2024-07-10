import Loader from "./utils/loader";
import API from "./api.service";
import {
  Branch,
  BranchData,
  BranchItemUpdate,
  ExtendedResponse,
  Response,
} from "@/types";

// !remove (some)
abstract class BranchService extends Loader {
  public static async newBranch({ ...props }: Branch): Promise<Response> {
    return await API.post<Branch>({
      endpoint: "/branch",
      payload: props,
    });
  }

  public static async getBranch({
    _id,
  }: {
    _id?: string;
  }): Promise<ExtendedResponse<BranchData[]>> {
    return await API.get<BranchData[]>({
      endpoint: "/branch",
      query: { _id },
    });
  }

  public static async updateBranch({ ...props }: BranchData) {
    return await API.post<Response>({
      endpoint: "/branch",
      payload: props,
    });
  }

  public static async getBranchSpecific(
    _id: string
  ): Promise<ExtendedResponse<BranchData>> {
    return await API.get<BranchData>({
      endpoint: "/branch/get-branch",
      query: { _id },
    });
  }

  public static async newItemBranch(_id: string, itemIds: string[]) {
    return await API.post<BranchData>({
      endpoint: "/branch/new-item",
      payload: { _id, itemIds },
    });
  }

  public static async updateItemBranch(
    _id: string,
    type: string,
    items: BranchItemUpdate[],
    transactId?: string
  ) {
    return await API.post<BranchData>({
      endpoint: "/branch/update-items",
      payload: { _id, items, type, transactId },
    });
  }

  public static async getItemSpecific(branchId: string, itemId: string) {
    let branch = await API.get<BranchData>({
      endpoint: "/branch/get-item-specific",
      query: { branchId },
    });

    return branch.data?.items?.filter((e) => e.itemId?._id == itemId);
  }
  public static async removeBranchItem(branchId: string, itemId: string) {
    return await API.get<Response>({
      endpoint: "/branch/remove-item",
      query: { branchId, itemId },
    });
  }
}

export default BranchService;
