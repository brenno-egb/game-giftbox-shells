import { giftboxSkins } from "@/games/templates/giftbox/skins";

export const gamesRegistry = {
  giftbox: {
    key: "giftbox",
    name: "Giftbox",
    slug: "giftbox",
    templateId: 7070,
    skins: giftboxSkins,
    defaultSkinId: "bronze",
  },
} as const;

export type GameKey = keyof typeof gamesRegistry;
export type GameEntry = (typeof gamesRegistry)[GameKey];

export function getGameEntry(key: string): GameEntry | null {
  return (gamesRegistry as any)[key] ?? null;
}

export function listGames() {
  return Object.values(gamesRegistry).map((g) => ({
    key: g.key,
    name: g.name,
    slug: g.slug,
    defaultSkinId: g.defaultSkinId,
  }));
}

export function resolveGameRoute(entry: GameEntry) {
  return `/games/${entry.slug}`;
}
