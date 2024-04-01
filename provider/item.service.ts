import Loader from "./utils/loader";
import Api from "./api.service";
import { Items } from "@/types";

// TODO: if new subcategory is added to an item, item should should set isParent to "true"

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

  public async newParentItem(str: string) {
    this.loaderPush("new-items");
    const response = await this.instance.post<Response>({
      endpoint: "/item/new",
      payload: {
        name: str,
        isParent: true,
      },
    });
    this.loaderPop("new-items");
    return response;
  }
}

export default ItemService;
