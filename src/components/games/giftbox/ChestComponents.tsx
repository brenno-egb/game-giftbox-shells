import type { CurrencyType } from "@/@sdk/smartico";

type CurrencyConfig = {
  src: string;
  scale: string;
};

const CURRENCY_CONFIG: Record<CurrencyType, CurrencyConfig> = {
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
};

type CurrencyIconProps = {
  type?: CurrencyType;
};

export const CurrencyIcon = ({ type }: CurrencyIconProps) => {
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