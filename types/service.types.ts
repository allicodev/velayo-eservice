// * User Service
export interface UserLoginProps {
  username: string;
  password: string;
}

export interface UpdateFeeProps {
  id: string;
  fee: number;
  threshold: number;
  additionalFee: number;
}

//* etc service

export interface UpdateBillWallet {
  id: string;
  isDisabled: boolean;
}
