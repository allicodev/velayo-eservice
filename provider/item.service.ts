import Loader from "./utils/loader";
import Api from "./api.service";
import { Items } from "@/types";

class ItemService extends Loader {
  private readonly instance = new Api();

  public async getItems() {
    this.loaderPush("new-items");
    const response = await this.instance.get<Items[]>({
      endpoint: "/item/all",
    });
    this.loaderPop("new-items");
    return response;
  }

  public async newItem(str: string, parentId?: string) {
    this.loaderPush("new-items");
    const response = await this.instance.post<Response>({
      endpoint: "/item/new",
      payload: {
        name: str,
        isParent: [null, undefined, ""].includes(parentId) ? true : false,
        parentId,
      },
    });
    this.loaderPop("new-items");
    return response;
  }
}

export default ItemService;
