import type {
  StoreItem,
  UserProfile,
  MiniGameTemplate,
  CurrencyType,
} from "@/@sdk/smartico";
import type { ChestItem, CategorizedChests } from "./chest.types";

export function getUserBalance(
  profile: UserProfile | null,
  type: CurrencyType
): number {
  if (!profile) return 0;

  const balances: Record<CurrencyType, number> = {
    points: profile.ach_points_balance ?? 0,
    diamonds: profile.ach_diamonds_balance ?? 0,
    gems: profile.ach_gems_balance ?? 0,
  };

  return balances[type] ?? 0;
}

export function canAffordItem(
  item: StoreItem,
  profile: UserProfile | null
): boolean {
  if (!profile || !item.can_buy) return false;
  const balance = getUserBalance(profile, item.purchase_type);
  return balance >= item.price;
}

export function filterChests(items: StoreItem[]): StoreItem[] {
  return items.filter((item) => item.type === "minigamespin");
}

export function enrichChestsWithGameData(
  chests: StoreItem[],
  games: MiniGameTemplate[],
  profile: UserProfile | null
): ChestItem[] {
  return chests.map((chest) => {
    const relatedGame = games.find((g) => g.pool === chest.pool);
    const hasAttempts = relatedGame ? (relatedGame.spin_count ?? 0) > 0 : false;
    const canAfford = canAffordItem(chest, profile);

    return {
      ...chest,
      templateId: relatedGame?.id as number | undefined,
      hasAttempts,
      canAfford,
    } as ChestItem;
  });
}

export function categorizeChests(chests: ChestItem[]): CategorizedChests {
  return {
    available: chests.filter((c) => c.hasAttempts),
    purchasable: chests.filter((c) => !c.hasAttempts && c.canAfford),
    locked: chests.filter((c) => !c.hasAttempts && !c.canAfford),
  };
}

export function hasAnyAvailableChest(chests: ChestItem[]): boolean {
  return chests.some((c) => c.hasAttempts);
}

export function getChestStatusMessage(chest: ChestItem): string {
  if (chest.hasAttempts) return "Clique para abrir!";
  if (chest.canAfford) return "Compre agora!";
  return `${chest.price} ${chest.purchase_type}`;
}