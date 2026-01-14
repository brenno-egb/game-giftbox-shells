import type { StoreItem, CurrencyType } from "@/@sdk/smartico";

export type ChestItem = StoreItem & {
  type: "minigamespin";
  templateId?: number;
  hasAttempts?: boolean;
  canAfford?: boolean;
};

export type ChestStatus = "ready" | "buyable" | "insufficient" | "locked";

export type ChestTheme = {
  accent: string;
  accentBorder: string;
  accentGlow: string;
  panelBg?: string;
  panelBorder?: string;
};

export type CategorizedChests = {
  available: ChestItem[];
  purchasable: ChestItem[];
  locked: ChestItem[];
};

export type ChestTier =
  | "bronze"
  | "silver"
  | "gold"
  | "emerald"
  | "diamond"
  | "black-diamond";

export const CHEST_ORDER: ChestTier[] = [
  "bronze",
  "silver",
  "gold",
  "emerald",
  "diamond",
  "black-diamond",
];

export const DEFAULT_THEME: ChestTheme = {
  accent: "#FFD000",
  accentBorder: "#FFDC62",
  accentGlow: "#00000080",
  panelBg: "#242424",
  panelBorder: "#4a4a4a",
};

export const READY_THEME: ChestTheme = {
  accent: "#00d000",
  accentBorder: "#007c00",
  accentGlow: "rgba(0,208,0,0.1)",
  panelBg: "#242424",
  panelBorder: "#00d000",
};

export const LOCKED_THEME: ChestTheme = {
  accent: "#555f6d",
  accentBorder: "#363d45",
  accentGlow: "transparent",
  panelBg: "#242424",
  panelBorder: "#4a4a4a",
};

export { CurrencyType };
