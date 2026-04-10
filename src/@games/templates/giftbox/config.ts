export const WHEEL_CONFIG = {
  STRIP_SIZE: 200,
  ANIMATION_DURATION_MS: 11000,
  START_POSITION_RATIO: 0.65,
  ITEM_WIDTH: 120,
  CONTAINER_HEIGHT: 144,
} as const;

export const CHEST_CONFIG = {
  SHAKE_DURATION_MS: 600,
  OPEN_DELAY_MS: 100,
  ANNOUNCEMENT_DELAY_MS: 200,
  POST_ANNOUNCEMENT_DELAY_MS: 1000,
  SIZE: 242,
} as const;

export const ANIMATION_CONFIG = {
  EASING: "easeOutQuint",
  FLOAT_DURATION: 3.2,
  GLOW_PULSE_DURATION: 2,
  SLOW_PULSE_DURATION: 4,
} as const;

export const TIMING = {
  RESIZE_DEBOUNCE: 100,
  COUNTDOWN_INTERVAL: 1000,
} as const;

export const DEFAULT_PRIZE_ICON = "/images/default-prize-icon.svg";

export const DEFAULT_BACKGROUND = {
  IMAGE: "https://static5.smr.vc/9b5ea38ee3c97cd1ba59b2-background.webp",
  COLOR: "#07080c",
} as const;

export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function calculateStepWidth(trackElement: HTMLElement | null): number {
  if (!trackElement) return WHEEL_CONFIG.ITEM_WIDTH;

  const items = trackElement.children;
  if (items.length < 2) return WHEEL_CONFIG.ITEM_WIDTH;

  const a = items[0] as HTMLElement;
  const b = items[1] as HTMLElement;

  return b.offsetLeft - a.offsetLeft;
}

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
