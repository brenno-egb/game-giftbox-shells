export type UserProfile = {
  user_id: number;
  public_username?: string;
  avatar_url?: string;
  avatar_id?: string;
  ach_points_balance: number;
  ach_points_ever: number;
  ach_diamonds_balance: number;
  ach_gems_balance: number;
  ach_level_current?: string;
  ach_level_current_id?: number;
  core_user_language?: string;
  core_wallet_currency?: string;
  user_country?: string;
  core_registration_date?: number;
  core_inbox_unread_count?: number;
  core_is_test_account?: boolean;
};

export type UserLevel = {
  id: number;
  name: string;
  image?: string;
  description?: string;
  ordinal_position: number;
  progress: number;
  required_level_counter_1?: number;
  required_level_counter_2?: number;
  required_points: number;
  visibility_points?: number | null;
  custom_data?: Record<string, any>;
};

export type PlayerInfo = {
  ach_points_balance?: number;
  [key: string]: any;
};