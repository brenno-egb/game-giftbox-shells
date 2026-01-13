/**
 * Tipos relacionados a compras na loja
 * Segue o padrão da Smartico API
 */

export type PurchaseResult = {
  err_code?: number;
  err_msg?: string;
  item_id?: number;
  user_balance?: number;
  [key: string]: any;
};

export type PurchaseState = {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  result: PurchaseResult | null;
};

export type PurchaseIntent = {
  itemId: number;
  itemName: string;
  price: number;
  currencyType: string;
  userBalance: number;
};