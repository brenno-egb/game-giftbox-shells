export type SkinTheme = {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentGlow: string;
  panelBg: string;
  panelBorder: string;
};

export type BaseSkin = {
  id: string;
  assetsBase: string;
  rivePath?: string;
  templateId?: number;
  storeId?: number;
  background?: string;
  backgroundStore?: string;
  backgroundColor?: string;
  theme?: Partial<SkinTheme>;
};
