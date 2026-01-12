import { StoreItem, UserProfile } from "@/@sdk/smartico";
import type { ChestItem, PurchaseType } from "./chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";

/**
 * Verifica se o usuário pode comprar o item
 */
export function canAffordItem(
  item: StoreItem,
  profile: UserProfile | null
): boolean {
  if (!profile || !item.can_buy) return false;

  const balance = getUserBalance(profile, item.purchase_type);
  return balance >= item.price;
}

/**
 * Retorna o saldo do usuário para o tipo de compra
 */
export function getUserBalance(
  profile: UserProfile | null,
  type: PurchaseType
): number {
  if (!profile) return 0;

  switch (type) {
    case "points":
      return profile.ach_points_balance ?? 0;
    case "diamonds":
      return profile.ach_diamonds_balance ?? 0;
    case "gems":
      return profile.ach_gems_balance ?? 0;
    default:
      return 0;
  }
}

/**
 * Filtra apenas os baús (type: minigamespin)
 */
export function filterChests(items: StoreItem[]): StoreItem[] {
  return items.filter((item) => item.type === "minigamespin");
}

/**
 * Relaciona baús com minigames e verifica se tem tentativas
 */
export function enrichChestsWithGameData(
  chests: StoreItem[],
  games: MiniGameTemplate[],
  profile: UserProfile | null
): ChestItem[] {
  return chests.map((chest) => {
    // Tenta encontrar minigame relacionado pelo pool
    const relatedGame = games.find((g) => g.pool === chest.pool);

    const hasAttempts =
      relatedGame && (relatedGame.spin_count ?? 0) > 0 ? true : false;

    const canAfford = canAffordItem(chest, profile);

    return {
      ...chest,
      templateId: relatedGame?.id,
      hasAttempts,
      canAfford,
    } as ChestItem;
  });
}

/**
 * Separa baús em disponíveis (tem tentativas) e compráveis
 */
export function categorizeChests(chests: ChestItem[]) {
  const available = chests.filter((c) => c.hasAttempts);
  const purchasable = chests.filter((c) => !c.hasAttempts && c.canAfford);
  const locked = chests.filter((c) => !c.hasAttempts && !c.canAfford);

  return { available, purchasable, locked };
}

/**
 * Verifica se o usuário tem pelo menos um baú disponível
 */
export function hasAnyAvailableChest(chests: ChestItem[]): boolean {
  return chests.some((c) => c.hasAttempts);
}

/**
 * Retorna mensagem de status do baú
 */
export function getChestStatusMessage(chest: ChestItem): string {
  if (chest.hasAttempts) {
    return "Clique para abrir!";
  }

  if (chest.canAfford) {
    return "Compre agora!";
  }

  return `${chest.price} ${chest.purchase_type}`;
}
