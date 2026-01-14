export type ChestTheme = {
  accent: string;
  accentBorder: string;
  accentGlow: string;
  panelBg?: string;
  panelBorder?: string;
};

export const DEFAULT_THEME: ChestTheme = {
  accent: "#FFD000",
  accentBorder: "#FFDC62",
  accentGlow: "#00000080",
  panelBg: "#242424",
  panelBorder: "#4a4a4a"
};

export const READY_THEME: ChestTheme = {
  accent: "#00d000",
  accentBorder: "#007c00",
  accentGlow: "rgba(0,208,0,0.1)",
  panelBg: "#242424",
  panelBorder: "#00d000"
};

export const LOCKED_THEME: ChestTheme = {
  accent: "#555f6d",
  accentBorder: "#363d45",
  accentGlow: "transparent",
  panelBg: "#242424",
  panelBorder: "#4a4a4a"
};

export const resolveChestTheme = (
  status: 'ready' | 'buyable' | 'insufficient' |  'locked', 
  skinTheme?: Partial<ChestTheme>
): ChestTheme => {
  
  if (status === 'ready') return READY_THEME;

  let theme = {
    ...DEFAULT_THEME,
    ...(skinTheme || {})
  };


  if (status === 'locked') {
    theme = {
      ...theme,
      ...LOCKED_THEME
    };
  }

  return theme;
};