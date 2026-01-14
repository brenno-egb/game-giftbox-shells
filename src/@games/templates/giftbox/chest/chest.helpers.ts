import { giftboxSkins } from "../skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import type { ChestItem, ChestTier } from "./chest.types";
import { CHEST_ORDER } from "./chest.types";

export function getGameUrl(skinId: string, uid: string, lang: string): string {
  return `/games/giftbox?skin=${skinId}&uid=${uid}&lang=${lang}`;
}

export function getGameSpins(game: MiniGameTemplate | undefined): number {
  if (!game) return 0;
  return typeof game.spin_count === "number" ? game.spin_count : 0;
}

export function findGameByTemplateId(
  games: MiniGameTemplate[],
  templateId: number | undefined
): MiniGameTemplate | undefined {
  if (!templateId) return undefined;
  return games.find((g) => Number(g.id) === Number(templateId));
}

export function getChestImageFromStore(
  chestImage: string | undefined
): string | null {
  return chestImage || null;
}

export function getSkinByChest(chest: ChestItem) {
  const skins = Object.values(giftboxSkins);

  if (chest.id) {
    const byStore = skins.find((s) => Number(s.storeId) === Number(chest.id));
    if (byStore) return byStore;
  }

  if (chest.templateId) {
    const byTemplate = skins.find(
      (s) => Number(s.templateId) === Number(chest.templateId)
    );
    if (byTemplate) return byTemplate;
  }

  if (chest.name) {
    const normalized = chest.name
      .toLowerCase()
      .replace(/baú\s+/, "")
      .trim();
    return skins.find(
      (s) => normalized.includes(s.id) || s.id.includes(normalized)
    );
  }

  return undefined;
}

export function getSkinByTemplateId(templateId: number) {
  return Object.values(giftboxSkins).find(
    (skin) => Number(skin.templateId) === Number(templateId)
  );
}

export function getChestShopImage(chest: ChestItem): string | null {
  const skin = getSkinByChest(chest);
  if (skin?.backgroundStore) {
    return `${skin.assetsBase}/${skin.backgroundStore}`;
  }
  return chest.image || null;
}

export function sortChestsByOrder(chests: ChestItem[]): ChestItem[] {
  return [...chests].sort((a, b) => {
    const skinA = getSkinByChest(a);
    const skinB = getSkinByChest(b);

    const orderA = skinA
      ? CHEST_ORDER.indexOf(skinA.id as ChestTier)
      : CHEST_ORDER.length;
    const orderB = skinB
      ? CHEST_ORDER.indexOf(skinB.id as ChestTier)
      : CHEST_ORDER.length;

    if (orderA === -1) return 1;
    if (orderB === -1) return -1;

    return orderA - orderB;
  });
}
