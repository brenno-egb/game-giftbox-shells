import { giftboxSkins } from "@/games/templates/giftbox/skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";

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