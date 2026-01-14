export type CurrencyType = "points" | "diamonds" | "gems";

export type StoreItemType = "minigamespin" | string;

export type StoreItem = {
  id: number;
  name: string;
  description?: string;
  purchase_type: CurrencyType;
  price: number;
  image?: string;
  type: StoreItemType;
  pool?: number;
  can_buy: boolean;
  active_till_date?: number;
  ribbon?: string;
  category_ids?: number[];
  custom_data?: Record<string, any>;
  priority?: number;
};

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
  currencyType: CurrencyType;
  userBalance: number;
};

export const CURRENCY_LABELS: Record<CurrencyType, string> = {
  points: "Pontos",
  diamonds: "Diamantes",
  gems: "Gemas",
};