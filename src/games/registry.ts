export type GameSlug = "bau-classic" | "bau-pink";

export const GAMES: Record<GameSlug, {
  slug: GameSlug;
  name: string;
  template: "giftbox";
  templateId: number;
  skinId: "classic" | "pink";
}> = {
  "bau-classic": {
    slug: "bau-classic",
    name: "Baú Giratório (Classic)",
    template: "giftbox",
    templateId: 7070,
    skinId: "classic",
  },
  "bau-pink": {
    slug: "bau-pink",
    name: "Baú Giratório (Pink)",
    template: "giftbox",
    templateId: 7070,
    skinId: "pink",
  }
};

export const GAMES_LIST = Object.values(GAMES);
