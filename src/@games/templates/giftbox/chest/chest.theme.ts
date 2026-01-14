import type { ChestTheme, ChestStatus } from "./chest.types";
import { DEFAULT_THEME, READY_THEME, LOCKED_THEME } from "./chest.types";

export function resolveChestTheme(
  status: ChestStatus,
  skinTheme?: Partial<ChestTheme>
): ChestTheme {
  if (status === "ready") return READY_THEME;

  const baseTheme: ChestTheme = {
    ...DEFAULT_THEME,
    ...skinTheme,
  };

  if (status === "locked" || status === "insufficient") {
    return {
      ...baseTheme,
      ...LOCKED_THEME,
    };
  }

  return baseTheme;
}

export { DEFAULT_THEME, READY_THEME, LOCKED_THEME };
