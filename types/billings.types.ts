// TODO: create efficient and good design for "select" options dudeeeee

interface FieldName {
  name: string;
}

export type BillingOptionsType =
  | "input"
  | "number"
  | "textarea"
  | "checkbox"
  | "select";

export interface InputOptions extends FieldName {
  minLength?: number | null;
  maxLength?: number | null;
}

export interface NumberOptions extends FieldName {
  min: number;
  max: number;
}

export interface TextAreaOptions extends FieldName {
  minRow: number;
  maxRow: number;
}

export interface SelectOptions extends FieldName {
  items: string[];
}

export interface CheckboxOptions extends FieldName {
  checked: boolean;
}

export interface BillingsFormField {
  type: BillingOptionsType;
  inputOption?: InputOptions;
  inputNumberOption?: NumberOptions;
  textareaOption?: TextAreaOptions;
  selectOption?: SelectOptions;
  checkboxOption?: CheckboxOptions;
}

export interface BillingSettingsType {
  name: string;
  formfield?: BillingsFormField[];
}

export interface OptionTypeWithFlag {
  open: boolean;
  options?: BillingsFormField | undefined | null;
}
