export interface SmarticoGame {
  id: number;
  name: string;
  thumbnail?: string;
  saw_game_type: "wheel" | "scratch" | "slot" | string;
  saw_buyin_type: "free" | "spins" | "points";

  prizes: any[];
  description?: string;
  promo_text?: string;
  no_attempts_message?: string;

  spin_count?: number;
  max_number_of_attempts?: number;

  next_available_spin_ts?: number | null;
  activeFromDate?: number;
  activeTillDate?: number;

  buyin_cost_points?: number;

  saw_template_ui_definition?: any;
  custom_data?: any;

  jackpot_add_on_attempt?: any;
  jackpot_current?: any;
  expose_game_stat_on_api?: boolean;
  show_prize_history?: boolean;
  relative_period_timezone?: number;
}

export interface SmarticoPlayerInfo {
  ach_points_balance?: number;
  [key: string]: any;
}

export interface SmarticoPlayResult {
  err_code: number;
  prize_id?: number | string;
  [key: string]: any;
}

export interface GameState {
  game: SmarticoGame | null;
  playerInfo: SmarticoPlayerInfo | null;
  canPlay: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  statusMessage: string;
  countdown: string | null;

  play: () => Promise<SmarticoPlayResult | null>;
  refresh: () => Promise<void>;
}

export interface AttemptsDisplay {
  label: string;
  value: string | number;
  valueColor?: string;
  showCountdown?: boolean;
}
