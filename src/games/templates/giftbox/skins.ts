import type { BaseSkin } from "@/games/core/types";

export const giftboxSkins = {
  classic: {
    id: "classic",
    assetsBase: "/games/giftbox/skins/classic",
    rivePath: "/games/giftbox/skins/classic/chest.riv",
    background: ""
  },
  bronze: {
    id: "bronze",
    assetsBase: "/games/giftbox/skins/bronze",
    rivePath: "/games/giftbox/skins/bronze/chest-bronze.riv",
    background: ""
  },
  silver: {
    id: "silver",
    assetsBase: "/games/giftbox/skins/silver",
    rivePath: "/games/giftbox/skins/silver/chest-silver.riv",
    templateId: 7070,
    background: "bg-silver.webp"
  },
  diamond: {
    id: "diamond",
    assetsBase: "/games/giftbox/skins/diamond",
    rivePath: "/games/giftbox/skins/diamond/chest-diamond.riv",
    templateId: 7070,
    background: ""
  },
  blackDiamond: {
    id: "black-diamond",
    assetsBase: "/games/giftbox/skins/black-diamond",
    rivePath: "/games/giftbox/skins/black-diamond/chest-black-diamond.riv",
    templateId: 7070,
    background: ""
  },
  emerald: {
    id: "emerald",
    assetsBase: "/games/giftbox/skins/emerald",
    rivePath: "/games/giftbox/skins/emerald/chest-emerald.riv",
    templateId: 7070,
    background: ""
  },
} as const satisfies Record<string, BaseSkin>;
