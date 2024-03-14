import Loader from "./utils/loader";
import Api from "./api.service";
import { BillingSettingsType, BillingsFormField } from "@/types";

class BillService extends Loader {
  private readonly instance = new Api();

  public async getBill() {
    this.loaderPush("get-bill");
    const response = await this.instance.get<BillingSettingsType[]>({
      endpoint: "/bill/get-bill",
    });
    this.loaderPop("get-bill");
    return response;
  }

  public async newBill(bill: BillingSettingsType) {
    this.loaderPush("new-bill");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/new-bill",
      payload: bill,
    });
    this.loaderPop("new-bill");
    return response;
  }

  public async pushToFormFields(billId: string, formfield: BillingsFormField) {
    this.loaderPush("new-option-bill");

    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/new-option",
      payload: {
        id: billId,
        formField: formfield,
      },
    });
    this.loaderPop("new-option-bill");
    return response;
  }

  public async updateFormFields(
    billId: string,
    formfield: BillingsFormField,
    index: number
  ) {
    this.loaderPush("update-option-bill");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/update-option",
      payload: {
        id: billId,
        formField: formfield,
        index,
      },
    });
    this.loaderPop("update-option-bill");
    return response;
  }

  public async updateBillOption(
    billId: string,
    billOption: BillingSettingsType
  ) {
    this.loaderPush("update-option");
    const response = await this.instance.post<BillingSettingsType>({
      endpoint: "/bill/update-bill-option",
      payload: {
        id: billId,
        billOption,
      },
    });
    this.loaderPop("update-option");
    return response;
  }

  public async removeOptionIndexed(billId: string, index: number) {
    this.loaderPush("removing-option");
    const response = await this.instance.get<BillingSettingsType>({
      endpoint: "/bill/delete-option",
      query: {
        id: billId,
        index,
      },
    });
    this.loaderPop("removing-option");
    return response;
  }

  public async updateBillName(billId: string, name: string) {
    this.loaderPush("removing-option");
    const response = await this.instance.get<BillingSettingsType>({
      endpoint: "/bill/update-bill",
      query: {
        id: billId,
        name,
      },
    });
    this.loaderPop("removing-option");
    return response;
  }
}

export default BillService;
