import type { BaseSkin } from "@/games/core/types";

export const giftboxSkins = {
  // GOLD: Não define tema -> Usa 100% o Default (Azul)
  gold: {
    id: "gold",
    assetsBase: "/games/giftbox/skins/gold",
    rivePath: "/games/giftbox/skins/gold/chest-gold.riv",
    templateId: 7282,
    storeId: 6127,
    background: "bg-gold.webp",
    backgroundStore: "bg-store-gold.png",
    backgroundColor: "#07080c",
    theme: {
      panelBorder: "#E1FF00"
    }
  },

  // BRONZE: Define Accent e AccentBorder para combinar
  bronze: {
    id: "bronze",
    assetsBase: "/games/giftbox/skins/bronze",
    rivePath: "/games/giftbox/skins/bronze/chest-bronze.riv",
    templateId: 7257,
    storeId: 6136,
    background: "bg-bronze.webp",
    backgroundStore: "bg-store-bronze.png",
    backgroundColor: "#703F29",
    theme: {
      panelBorder: "#703F29",
    },
  },

  // SILVER: Não define tema -> Usa Default (Azul)
  silver: {
    id: "silver",
    assetsBase: "/games/giftbox/skins/silver",
    rivePath: "/games/giftbox/skins/silver/chest-silver.riv",
    templateId: 7279,
    storeId: 6126,
    background: "bg-silver.webp",
    backgroundStore: "bg-store-silver.png",
    backgroundColor: "#07080c",
    theme: {
      panelBorder: "#D9D9D9"
    }
  },

  // DIAMOND: Define tudo
  diamond: {
    id: "diamond",
    assetsBase: "/games/giftbox/skins/diamond",
    rivePath: "/games/giftbox/skins/diamond/chest-diamond.riv",
    templateId: 7284,
    storeId: 6129,
    background: "bg-diamond.webp",
    backgroundStore: "bg-store-diamond.png",
    backgroundColor: "#05070b",
    theme: {
      accent: "#5A55FF",
      accentBorder: "#4944FF",
      accentSoft: "rgba(139,233,255,.72)", // Opcional, se usar em outro lugar
      accentGlow: "rgba(139,233,255,.20)",
      panelBg: "rgba(0,0,0,.52)",
      panelBorder: "rgba(255,255,255,.12)",
    },
  },

  // BLACK DIAMOND: Define tudo
  blackDiamond: {
    id: "black-diamond",
    assetsBase: "/games/giftbox/skins/black-diamond",
    rivePath: "/games/giftbox/skins/black-diamond/chest-black-diamond.riv",
    templateId: 7285,
    storeId: 6130,
    background: "bg-black-diamond.webp",
    backgroundStore: "bg-store-black-diamond.png",
    backgroundColor: "#030409",
    theme: {
      accent: "black",
      accentBorder: "#333333", // Cinza escuro para aparecer no fundo preto
      accentSoft: "rgba(199,166,255,.70)",
      accentGlow: "black",
      panelBg: "rgba(0,0,0,.58)",
      panelBorder: "rgba(255,255,255,.10)",
    },
  },

  // EMERALD: Só define Accent e Border
  emerald: {
    id: "emerald",
    assetsBase: "/games/giftbox/skins/emerald",
    rivePath: "/games/giftbox/skins/emerald/chest-emerald.riv",
    templateId: 7283,
    storeId: 6128,
    background: "bg-emerald.webp",
    backgroundStore: "bg-store-emerald.png",
    backgroundColor: "#04080a",
    theme: {
      panelBorder: "#00FF15"
    }
  },
} as const satisfies Record<string, BaseSkin>;