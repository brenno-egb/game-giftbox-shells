const CURRENCY_CONFIG = {
  points: {
    src: "/games/giftbox/assets/currency/coin.png",
    scale: "",
  },
  diamonds: {
    src: "/games/giftbox/assets/currency/key_gold.png",
    scale: "scale-190",
  },
  gems: {
    src: "/games/giftbox/assets/currency/key_emerald.png",
    scale: "scale-200",
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