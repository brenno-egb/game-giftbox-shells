const CURRENCY_CONFIG = {
  points: {
    src: "/games/giftbox/assets/currency/coin.webp",
    scale: "",
  },
  diamonds: {
    src: "/games/giftbox/assets/currency/key_gold.webp",
    scale: "scale-120",
  },
  gems: {
    src: "/games/giftbox/assets/currency/key_diamond.webp",
    scale: "scale-120",
  },
} as const;

export type CurrencyType = keyof typeof CURRENCY_CONFIG;

export const CurrencyIcon = ({ type }: { type?: CurrencyType }) => {
  if (!type || !CURRENCY_CONFIG[type]) return null;
  
  const { src, scale } = CURRENCY_CONFIG[type];
  
  return (
    <img
      src={src}
      className={`w-full h-full object-contain ${scale}`}
      alt={type}
    />
  );
};

export const GameIcons = {
  Coin: () => <CurrencyIcon type="points" />,
  Diamond: () => <CurrencyIcon type="diamonds" />,
  Gem: () => <CurrencyIcon type="gems" />,
};