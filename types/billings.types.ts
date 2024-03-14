export interface SelectItem {
  name: string;
  value: string;
}

export type BillingOptionsType =
  | "input"
  | "number"
  | "textarea"
  | "checkbox"
  | "select";

export interface InputOptions {
  minLength?: number | null;
  maxLength?: number | null;
}

export interface NumberOptions {
  min?: number | null;
  max?: number | null;
}

export interface TextAreaOptions {
  minRow?: number | null;
  maxRow?: number | null;
}

export interface SelectOptions {
  items?: SelectItem[] | null;
}

export interface CheckboxOptions {
  checked?: boolean | null;
}

export interface BillingsFormField {
  type: BillingOptionsType;
  name: string;
  inputOption?: InputOptions;
  inputNumberOption?: NumberOptions;
  textareaOption?: TextAreaOptions;
  selectOption?: SelectOptions;
  checkboxOption?: CheckboxOptions;
}

export interface BillingSettingsType {
  _id?: string;
  name: string;
  formField?: BillingsFormField[];
}

export interface OptionTypeWithFlag {
  open: boolean;
  options?: BillingsFormField | undefined | null;
  id: string | null;
  index: number;
}
