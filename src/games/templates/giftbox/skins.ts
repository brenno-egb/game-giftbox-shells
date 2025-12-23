import type { BaseSkin } from "@/games/core/types";

export const giftboxSkins = {
  gold: {
    id: "gold",
    assetsBase: "/games/giftbox/skins/gold",
    rivePath: "/games/giftbox/skins/gold/chest-gold.riv",
    background: "bg-gold.webp",
    backgroundColor: "#07080c",
    theme: {
      accent: "#facc15", // gold
      accentSoft: "rgba(250,204,21,.65)",
      accentBorder: "rgba(250,204,21,.30)",
      accentGlow: "rgba(250,204,21,.20)",
      panelBg: "rgba(0,0,0,.45)",
      panelBorder: "rgba(255,255,255,.10)",
    },
  },

  bronze: {
    id: "bronze",
    assetsBase: "/games/giftbox/skins/bronze",
    rivePath: "/games/giftbox/skins/bronze/chest-bronze.riv",
    background: "bg-bronze.webp",
    backgroundColor: "#07080c",
    theme: {
      accent: "#d18b47", // bronze
      accentSoft: "rgba(209,139,71,.70)",
      accentBorder: "rgba(209,139,71,.32)",
      accentGlow: "rgba(209,139,71,.20)",
      panelBg: "rgba(0,0,0,.50)",
      panelBorder: "rgba(255,255,255,.12)",
    },
  },

  silver: {
    id: "silver",
    assetsBase: "/games/giftbox/skins/silver",
    rivePath: "/games/giftbox/skins/silver/chest-silver.riv",
    background: "bg-silver.webp",
    backgroundColor: "#07080c",
    theme: {
      accent: "#e5e7eb", // silver
      accentSoft: "rgba(229,231,235,.72)",
      accentBorder: "rgba(229,231,235,.28)",
      accentGlow: "rgba(229,231,235,.18)",
      panelBg: "rgba(0,0,0,.50)",
      panelBorder: "rgba(255,255,255,.12)",
    },
  },

  diamond: {
    id: "diamond",
    assetsBase: "/games/giftbox/skins/diamond",
    rivePath: "/games/giftbox/skins/diamond/chest-diamond.riv",
    templateId: 7070,
    background: "bg-diamond.webp",
    backgroundColor: "#05070b",
    theme: {
      accent: "#8be9ff", // icy cyan (diamond)
      accentSoft: "rgba(139,233,255,.72)",
      accentBorder: "rgba(139,233,255,.30)",
      accentGlow: "rgba(139,233,255,.20)",
      panelBg: "rgba(0,0,0,.52)",
      panelBorder: "rgba(255,255,255,.12)",
    },
  },

  blackDiamond: {
    id: "black-diamond",
    assetsBase: "/games/giftbox/skins/black-diamond",
    rivePath: "/games/giftbox/skins/black-diamond/chest-black-diamond.riv",
    templateId: 7070,
    background: "bg-black-diamond.webp",
    backgroundColor: "#030409",
    theme: {
      accent: "#c7a6ff", // deep violet highlight
      accentSoft: "rgba(199,166,255,.70)",
      accentBorder: "rgba(199,166,255,.28)",
      accentGlow: "rgba(199,166,255,.18)",
      panelBg: "rgba(0,0,0,.58)",
      panelBorder: "rgba(255,255,255,.10)",
    },
  },

  emerald: {
    id: "emerald",
    assetsBase: "/games/giftbox/skins/emerald",
    rivePath: "/games/giftbox/skins/emerald/chest-emerald.riv",
    templateId: 7070,
    background: "bg-emerald.webp",
    backgroundColor: "#04080a",
    theme: {
      accent: "#34d399",
      accentSoft: "rgba(52,211,153,.70)",
      accentBorder: "rgba(52,211,153,.30)",
      accentGlow: "rgba(52,211,153,.20)",
      panelBg: "rgba(0,0,0,.52)",
      panelBorder: "rgba(255,255,255,.12)",
    },
  },
} as const satisfies Record<string, BaseSkin>;
