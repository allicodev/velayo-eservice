import API from "./api.service";
import {
  InputProps,
  Item,
  ItemCode,
  ItemData,
  TransactionPOS,
  OnlinePayment,
  Transaction,
  Response,
  BranchData,
} from "@/types";

abstract class ItemService {
  public static async getItems(query?: any) {
    return await API.get<BranchData[] | ItemData[]>({
      endpoint: "item/all",
      query,
    });
  }

  public static async newItem(str: any, parentId?: string) {
    return await API.post<Response>({
      endpoint: "item/new",
      payload: {
        ...str,
        parentId,
      },
    });
  }

  public static async getLastItemcode() {
    return await API.get<ItemCode>({
      endpoint: "item/get-last-itemcode",
    });
  }

  public static async getItemSpecific(id: string) {
    return await API.get<ItemData>({
      endpoint: "item/specific",
      query: {
        id,
      },
    });
  }

  public static async deleteItem(id: string) {
    return await API.get<Item>({
      endpoint: "item/delete",
      query: {
        id,
      },
    });
  }

  public static async updateItem(id: string, item: InputProps) {
    return await API.post<ItemData>({
      endpoint: "item/update",
      payload: {
        ...item,
        id,
      },
    });
  }

  public static async searchItem(search: string) {
    return await API.get<ItemData[]>({
      endpoint: "item/search",
      query: {
        search,
      },
    });
  }

  public static async purgeItem(id: string) {
    const response = await API.get<ItemData[]>({
      endpoint: "item/purge-item",
      query: {
        id,
      },
    });
    return response;
  }

  public static async requestTransaction(
    transactionDetails: string,
    cash: number,
    amount: number,
    fee: number,
    tellerId: string,
    branchId: string,
    reference: string,
    online?: OnlinePayment,
    creditId?: string | null
  ) {
    let transaction: TransactionPOS = {
      type: "miscellaneous",
      transactionDetails, // crucial
      reference,
      cash,
      amount,
      tellerId,
      branchId,
      creditId,
      fee,
      ...(online?.isOnlinePayment ?? false ? online : {}),
      history:
        online?.isOnlinePayment ?? false
          ? [
              {
                description: "First  Transaction requested",
                status: "pending",
                createdAt: new Date(),
              },
            ]
          : [
              {
                description: "Transaction Completed",
                status: "completed",
                createdAt: new Date(),
              },
            ],
    };

    return await API.post<Transaction>({
      endpoint: "bill/request-transaction",
      payload: { ...transaction, branchId },
    });
  }
}

export default ItemService;
