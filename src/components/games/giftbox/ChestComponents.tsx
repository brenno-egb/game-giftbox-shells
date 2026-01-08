"use client";

export const CurrencyIcon = ({ type }: { type?: string }) => {
  if (type === "gems") {
    return (
      <img
        src="/games/giftbox/assets/currency/key_emerald.png"
        className="w-full h-full object-contain scale-200"
      />
    );
  }
  if (type === "diamonds") {
    return (
      <img
        src="/games/giftbox/assets/currency/key_gold.png"
        className="w-full h-full object-contain scale-160"
      />
    );
  }
  if (type === "coins") {
    return (
      <img
        src="/games/giftbox/assets/currency/coin.png"
        className="w-full h-full object-contain"
      />
    );
  }
};
