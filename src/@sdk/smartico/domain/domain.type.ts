export type MiniGameTemplate = {
  id: number | string;
  saw_buyin_type?: "free" | "spins" | "points" | string;
  spin_count?: number;
  buyin_cost_points?: number;
  next_available_spin_ts?: number;
  activeFromDate?: number;
  activeTillDate?: number;
  no_attempts_message?: string;
  max_number_of_attempts?: number;
  prizes?: PrizeLike[];
  [key: string]: any; 
};

export type PrizeLike = {
  id?: number | string;
  name?: string;
  acknowledge_dp?: unknown;
  acknowledge_message?: string;
  aknowledge_message?: string;
  [key: string]: any;
};

export type PlayerInfo = {
  ach_points_balance?: number;
  [key: string]: any;
};

export type LoadStateResult = {
  game: MiniGameTemplate | null;
  playerInfo: PlayerInfo | null;
  canPlay: boolean;
  status: string;
  nextAvailableTs: number | null;
};

export type PlayResult = {
  prize_id?: number | string;
  err_code?: number;
  err_msg?: string;
  [key: string]: any;
};

export type HistoryParams = {
  limit?: number;
  offset?: number;
  templateId?: number;
};

/**
 * Tipos relacionados aos baús e itens da loja
 */

export type StoreItem = {
  id: number;
  name: string;
  description?: string;
  purchase_type: "points" | "diamonds" | "gems";
  price: number;
  image?: string;
  type: string;
  pool?: number;
  can_buy: boolean;
  active_till_date?: number;
  ribbon?: string;
  category_ids?: number[];
  custom_data?: Record<string, any>;
  priority?: number;
};

export type UserProfile = {
  user_id: number;
  public_username?: string;
  avatar_url?: string;
  avatar_id?: string;
  
  // Pontos e moedas
  ach_points_balance: number;
  ach_points_ever: number;
  ach_diamonds_balance: number;
  ach_gems_balance: number;
  
  // Level
  ach_level_current?: string;
  ach_level_current_id?: number;
  
  // Outros
  core_user_language?: string;
  core_wallet_currency?: string;
  user_country?: string;
  core_registration_date?: number;
  core_inbox_unread_count?: number;
  core_is_test_account?: boolean;
};