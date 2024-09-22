import _ from "lodash";
import { CashboxFormProps } from "../cashbox.types";

const useUpdateForm = (props: CashboxFormProps) => {
  const { data, updateBalance } = props;
  const canSubmit = () => _.some(Object.values(data), (val) => !val);

  return { ...props, canSubmit: canSubmit(), updateBalance };
};

export default useUpdateForm;
