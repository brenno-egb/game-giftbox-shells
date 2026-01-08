/**
 * ⚙️ CONFIGURAÇÕES DO GIFTBOX GAME
 * 
 * Centraliza todos os magic numbers e configurações
 * para fácil ajuste e manutenção
 */

export const WHEEL_CONFIG = {
  /**
   * Tamanho alvo da strip de prêmios
   * Quantos items ter na roleta (aproximado)
   */
  STRIP_SIZE: 200,

  /**
   * Duração da animação de giro em milissegundos
   * 11 segundos = experiência dramática
   */
  ANIMATION_DURATION_MS: 11000,

  /**
   * Posição inicial do alvo na strip (0.0 a 1.0)
   * 0.65 = começa em 65% da strip
   */
  START_POSITION_RATIO: 0.65,

  /**
   * Largura de cada item de prêmio em pixels
   */
  ITEM_WIDTH: 120,

  /**
   * Altura do container da roleta
   */
  CONTAINER_HEIGHT: 144, // h-36 em Tailwind = 144px
} as const;

export const CHEST_CONFIG = {
  /**
   * Duração do shake antes de abrir (ms)
   */
  SHAKE_DURATION_MS: 600,

  /**
   * Delay antes de mostrar a roleta após abrir (ms)
   */
  OPEN_DELAY_MS: 100,

  /**
   * Delay antes de mostrar o anúncio de prêmio (ms)
   */
  ANNOUNCEMENT_DELAY_MS: 200,

  /**
   * Tempo de espera após anúncio antes de permitir novo giro (ms)
   */
  POST_ANNOUNCEMENT_DELAY_MS: 1000,

  /**
   * Tamanho do baú em pixels (w-60.5 h-60.5)
   */
  SIZE: 242, // 60.5 * 4 = 242px
} as const;

export const ANIMATION_CONFIG = {
  /**
   * Easing function para a roleta
   * Quintic ease-out para desaceleração suave
   */
  EASING: "easeOutQuint",

  /**
   * Duração da animação de float do baú (s)
   */
  FLOAT_DURATION: 3.2,

  /**
   * Duração da pulsação do glow (s)
   */
  GLOW_PULSE_DURATION: 2,

  /**
   * Duração da pulsação lenta (s)
   */
  SLOW_PULSE_DURATION: 4,
} as const;

export const TIMING = {
  /**
   * Delay para resize/recalculate após animação (ms)
   */
  RESIZE_DEBOUNCE: 100,

  /**
   * Intervalo do ticker de countdown (ms)
   */
  COUNTDOWN_INTERVAL: 1000,
} as const;

/**
 * Ícone padrão quando prêmio não tem imagem
 */
export const DEFAULT_PRIZE_ICON = "/images/default-prize-icon.svg";

/**
 * Fallback background quando skin não tem
 */
export const DEFAULT_BACKGROUND = {
  IMAGE: "/games/giftbox/background.avif",
  COLOR: "#07080c",
} as const;

/**
 * Easing function quintic
 * Usado na animação da roleta
 */
export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Helper para calcular step width baseado em elementos do DOM
 */
export function calculateStepWidth(
  trackElement: HTMLElement | null
): number {
  if (!trackElement) return WHEEL_CONFIG.ITEM_WIDTH;

  const items = trackElement.children;
  if (items.length < 2) return WHEEL_CONFIG.ITEM_WIDTH;

  const a = items[0] as HTMLElement;
  const b = items[1] as HTMLElement;

  return b.offsetLeft - a.offsetLeft;
}

/**
 * Helper para calcular posição alvo do item
 */
export function calculateTargetX(
  trackElement: HTMLElement | null,
  itemIndex: number,
  currentX: number
): number {
  if (!trackElement) return currentX;

  const viewport = trackElement.parentElement;
  const item = trackElement.children[itemIndex] as HTMLElement;

  if (!viewport || !item) return currentX;

  const viewportCenter = viewport.clientWidth / 2;
  const itemCenter = item.offsetLeft + item.offsetWidth / 2;

  return Math.round(viewportCenter - itemCenter);
}

/**
 * EXEMPLO DE USO:
 * 
 * import { WHEEL_CONFIG, CHEST_CONFIG, easeOutQuint } from './config';
 * 
 * // Usar duração de animação
 * await animateTo(from, to, WHEEL_CONFIG.ANIMATION_DURATION_MS);
 * 
 * // Usar easing
 * const eased = easeOutQuint(progress);
 * 
 * // Usar delay do shake
 * setTimeout(() => openChest(), CHEST_CONFIG.SHAKE_DURATION_MS);
 */