export type WalletForEdit = {
  id: string;
  name: string;
  openingBalance: number;
  isDefault: boolean;
};

export type WalletCreateFormProps = {
  language: string;
  currency: string;
  wallet?: WalletForEdit;
  trigger?: "primary" | "icon";
};

export type MainWalletCardWallet = {
  id: string;
  name: string;
  type: string;
  balance: number;
  openingBalance: number;
  isDefault: boolean;
};

export type MainWalletCardProps = {
  wallet: MainWalletCardWallet;
  currency: string;
  language: string;
  icon: string;
};
