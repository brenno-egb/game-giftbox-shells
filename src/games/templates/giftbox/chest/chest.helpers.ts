import { giftboxSkins } from "@/games/templates/giftbox/skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";

/**
 * Gera URL do jogo com skin
 */
export function getGameUrl(skinId: string, uid: string, lang: string): string {
  return `/games/giftbox?skin=${skinId}&uid=${uid}&lang=${lang}`;
}

/**
 * Obtém número de spins disponíveis do game (mesma lógica do GameHost)
 */
export function getGameSpins(game: MiniGameTemplate | undefined): number {
  if (!game) return 0;
  
  const spinCount = game.spin_count;
  return typeof spinCount === "number" ? spinCount : 0;
}

/**
 * Encontra game por templateId na lista de games
 * templateId é o mesmo que MiniGame.id
 */
export function findGameByTemplateId(
  games: MiniGameTemplate[],
  templateId: number | undefined
): MiniGameTemplate | undefined {
  if (!templateId) return undefined;
  return games.find((g) => Number(g.id) === Number(templateId));
}

/**
 * Obtém imagem do baú da loja
 * Para ChestShop: usa chest.image (da loja)
 * Para ChestCarousel: usa skin.background diretamente
 */
export function getChestImageFromStore(chestImage: string | undefined): string | null {
  return chestImage || null;
}

/**
 * Tenta encontrar a skin associada a um ChestItem usando múltiplas estratégias.
 * Prioridade: 
 * 1. Store ID (chest.id === skin.storeId) -> Exato para a loja
 * 2. Template ID (chest.templateId === skin.templateId) -> Fallback técnico
 * 3. Nome (Fuzzy match) -> Fallback visual
 */
export function getSkinByChest(chest: ChestItem) {
  const skins = Object.values(giftboxSkins);

  // 1. Pelo ID da Loja (Prioridade Máxima)
  if (chest.id) {
    const byStore = skins.find((s) => Number(s.storeId) === Number(chest.id));
    if (byStore) return byStore;
  }

  // 2. Pelo Template ID
  if (chest.templateId) {
    const byTemplate = skins.find((s) => Number(s.templateId) === Number(chest.templateId));
    if (byTemplate) return byTemplate;
  }

  // 3. Pelo Nome (Fallback)
  if (chest.name) {
    const normalizedName = chest.name.toLowerCase().replace(/baú\s+/, "").trim();
    return skins.find((s) => normalizedName.includes(s.id) || s.id.includes(normalizedName));
  }

  return undefined;
}

/**
 * Helper legado ou para uso direto quando só se tem o templateId
 */
export function getSkinByTemplateId(templateId: number) {
  return Object.values(giftboxSkins).find(
    (skin) => Number(skin.templateId) === Number(templateId)
  );
}