import Loader from "./utils/loader";
import Api from "./api.service";
import { InputProps, Item, ItemCode, ItemData } from "@/types";

class ItemService extends Loader {
  private readonly instance = new Api();

  public async getItems(isParent?: boolean) {
    this.loaderPush("new-items");
    const response = await this.instance.get<ItemData[]>({
      endpoint: "/item/all",
      query: {
        isParent,
      },
    });
    this.loaderPop("new-items");
    return response;
  }

  public async newItem(str: any, parentId?: string) {
    this.loaderPush("new-items");
    const response = await this.instance.post<Response>({
      endpoint: "/item/new",
      payload: {
        ...str,
        parentId,
      },
    });
    this.loaderPop("new-items");
    return response;
  }

  public async getLastItemcode() {
    this.loaderPush("fetch-last-code");
    const response = await this.instance.get<ItemCode>({
      endpoint: "/item/get-last-itemcode",
    });
    this.loaderPop("fetch-last-code");
    return response;
  }

  public async getItemSpecific(id: string) {
    this.loaderPush("get-item");
    const response = await this.instance.get<ItemData>({
      endpoint: "/item/specific",
      query: {
        id,
      },
    });
    this.loaderPop("get-item");
    return response;
  }

  public async deleteItem(id: string) {
    this.loaderPush("delete-item");
    const response = await this.instance.get<Item>({
      endpoint: "/item/delete",
      query: {
        id,
      },
    });
    this.loaderPop("delete-item");
    return response;
  }

  public async updateItem(id: string, item: InputProps) {
    this.loaderPush("update-item");
    const response = await this.instance.post<ItemData>({
      endpoint: "/item/update",
      payload: {
        ...item,
        id,
      },
    });
    this.loaderPop("update-item");
    return response;
  }

  public async searchItem(search: string) {
    this.loaderPush("search-item");
    const response = await this.instance.get<ItemData[]>({
      endpoint: "/item/search",
      query: {
        search,
      },
    });
    this.loaderPop("search-item");
    return response;
  }
}

export default ItemService;
