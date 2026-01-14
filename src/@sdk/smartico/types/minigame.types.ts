import type { PlayerInfo } from "./user.types";

export type BuyinType = "free" | "spins" | "points";

export type MiniGameTemplate = {
  id: number | string;
  name?: string;
  thumbnail?: string;
  saw_buyin_type?: BuyinType | string;
  spin_count?: number;
  buyin_cost_points?: number;
  next_available_spin_ts?: number;
  activeFromDate?: number;
  activeTillDate?: number;
  no_attempts_message?: string;
  max_number_of_attempts?: number;
  pool?: number;
  prizes?: Prize[];
  [key: string]: any;
};

export type Prize = {
  id?: number | string;
  name?: string;
  acknowledge_dp?: unknown;
  acknowledge_message?: string;
  aknowledge_message?: string;
  [key: string]: any;
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

export type LoadStateResult = {
  game: MiniGameTemplate | null;
  playerInfo: PlayerInfo | null;
  canPlay: boolean;
  status: string;
  nextAvailableTs: number | null;
};