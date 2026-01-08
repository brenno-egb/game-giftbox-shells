import type { BaseSkin } from "@/games/core/types";

// 1. Tipagem Forte do Tema
export type ChestTheme = {
  accent: string;       // Cor do Fundo do Botão / Borda Externa do Card
  accentBorder: string; // Cor da Borda Inferior do Botão (A parte 3D escura)
  accentGlow: string;   // Sombra/Brilho externo
  panelBg?: string;     // Fundo do Card (opcional)
  panelBorder?: string; // Borda do Card (opcional)
};

// 2. TEMA PADRÃO (Blue) - Usado se a skin não tiver nada
export const DEFAULT_THEME: ChestTheme = {
  accent: "#FFD000",
  accentBorder: "#FFDC62", // Azul mais escuro
  accentGlow: "#00000080",
  panelBg: "#242424",
  panelBorder: "#4a4a4a"
};

// 3. TEMA "READY" (Green) - Sobrescreve tudo quando tem giros
export const READY_THEME: ChestTheme = {
  accent: "#00d000",
  accentBorder: "#007c00", // Verde mais escuro
  accentGlow: "rgba(0,208,0,0.1)",
  panelBg: "#242424",
  panelBorder: "#00d000"
};

// 4. TEMA "LOCKED" (Gray) - Quando não pode comprar
export const LOCKED_THEME: ChestTheme = {
  accent: "#555f6d",
  accentBorder: "#363d45", // Cinza mais escuro
  accentGlow: "transparent",
  panelBg: "#242424",
  panelBorder: "#4a4a4a"
};

// 5. Função Resolver
export const resolveChestTheme = (
  status: 'ready' | 'buyable' | 'locked', 
  skinTheme?: Partial<ChestTheme>
): ChestTheme => {
  if (status === 'ready') return READY_THEME;
  if (status === 'locked') return LOCKED_THEME;

  // MERGE INTELIGENTE:
  // Começa com o Default -> Substitui pelo que a skin tiver
  return {
    ...DEFAULT_THEME,
    ...(skinTheme || {})
  };
};