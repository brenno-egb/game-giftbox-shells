import type { BaseSkin } from "@/@games/core/types";

export const giftboxSkins = {
  gold: {
    id: "gold",
    assetsBase: "/games/giftbox/skins/gold",
    rivePath: "/games/giftbox/skins/gold/chest-gold.riv",
    templateId: 7282,
    storeId: 6127,
    background: "bg-gold.webp",
    backgroundStore: "bg-store-gold.webp",
    backgroundColor: "#07080c",
    theme: {
      panelBorder: "#FFAE00",
    },
  },

  bronze: {
    id: "bronze",
    assetsBase: "/games/giftbox/skins/bronze",
    rivePath: "/games/giftbox/skins/bronze/chest-bronze.riv",
    templateId: 7257,
    storeId: 6136,
    background: "bg-bronze.webp",
    backgroundStore: "bg-store-bronze.webp",
    backgroundColor: "#703F29",
    theme: {
      panelBorder: "#703F29",
    },
  },

  silver: {
    id: "silver",
    assetsBase: "/games/giftbox/skins/silver",
    rivePath: "/games/giftbox/skins/silver/chest-silver.riv",
    templateId: 7279,
    storeId: 6126,
    background: "bg-silver.webp",
    backgroundStore: "bg-store-silver.webp",
    backgroundColor: "#07080c",
    theme: {
      panelBorder: "#D9D9D9",
    },
  },

  diamond: {
    id: "diamond",
    assetsBase: "/games/giftbox/skins/diamond",
    rivePath: "/games/giftbox/skins/diamond/chest-diamond.riv",
    templateId: 7284,
    storeId: 6129,
    background: "bg-diamond.webp",
    backgroundStore: "bg-store-diamond.webp",
    backgroundColor: "#05070b",
    theme: {
      accent: "#5A55FF",
      accentBorder: "#4944FF",
      accentSoft: "rgba(139,233,255)",
      accentGlow: "#4B4EFF",
      panelBg: "rgba(0,0,0,.52)",
      panelBorder: "#4B4EFF",
    },
  },

  blackDiamond: {
    id: "black-diamond",
    assetsBase: "/games/giftbox/skins/black-diamond",
    rivePath: "/games/giftbox/skins/black-diamond/chest-black-diamond.riv",
    templateId: 7285,
    storeId: 6130,
    background: "bg-black-diamond.webp",
    backgroundStore: "bg-store-black-diamond.webp",
    backgroundColor: "#030409",
    theme: {
      accent: "black",
      accentBorder: "#333333",
      accentSoft: "rgba(199,166,255)",
      accentGlow: "black",
      panelBg: "rgba(0,0,0,.58)",
      panelBorder: "#4D4D4D",
    },
  },

  emerald: {
    id: "emerald",
    assetsBase: "/games/giftbox/skins/emerald",
    rivePath: "/games/giftbox/skins/emerald/chest-emerald.riv",
    templateId: 7283,
    storeId: 6128,
    background: "bg-emerald.webp",
    backgroundStore: "bg-store-emerald.webp",
    backgroundColor: "#04080a",
    theme: {
      panelBorder: "#00FF15",
      accentGlow: "#00FF15",
    },
  },
} as const satisfies Record<string, BaseSkin>;
