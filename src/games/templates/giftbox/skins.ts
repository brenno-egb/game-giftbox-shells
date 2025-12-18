export const giftboxSkins = {
  classic: {
    id: "classic",
    title: "Baú Giratório",
    subtitle: "Abra o baú e acompanhe a roleta",
    // você pode apontar pra imagens em /public/games/giftbox/skins/classic/...
    assetsBase: "/games/giftbox/skins/classic"
  },
  pink: {
    id: "pink",
    title: "Baú Giratório (Pink)",
    subtitle: "Mesma base, outra skin",
    assetsBase: "/games/giftbox/skins/pink"
  }
} as const;
