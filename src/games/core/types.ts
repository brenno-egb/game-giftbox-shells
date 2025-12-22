export type SkinTheme = {
  accent: string;       // destaque (substitui “amarelo”)
  accentSoft: string;   // texto/linhas mais fracas
  accentBorder: string; // bordas
  accentGlow: string;   // sombras/glow
  panelBg: string;      // cards/containers
  panelBorder: string;  // borda dos cards
};

export type BaseSkin = {
  id: string;
  assetsBase: string;
  rivePath?: string;
  templateId?: number;

  background?: string;
  backgroundColor?: string;

  theme?: Partial<SkinTheme>;
};
