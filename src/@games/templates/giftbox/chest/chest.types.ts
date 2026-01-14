import { StoreItem } from "@/@sdk/smartico";

export type ChestItem = StoreItem & {
  type: "minigamespin";
  templateId?: number;
  hasAttempts?: boolean; // Pode jogar agora
  canAfford?: boolean; // Tem saldo para comprar
};

export type PurchaseType = "points" | "diamonds" | "gems";

export const PURCHASE_TYPE_LABELS: Record<PurchaseType, string> = {
  points: "Pontos",
  diamonds: "Diamantes",
  gems: "Gemas",
};
