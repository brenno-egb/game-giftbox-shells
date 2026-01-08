"use client";

import React from "react";

// --- ÍCONE DE MOEDA ---
export const CurrencyIcon = ({ type }: { type?: string }) => {
    console.log(type)
  if (type === 'gems') {
    return (
      <img src="/games/giftbox/assets/key_emerald.png" className="w-full h-full object-contain scale-200" />
    );
  }
  if (type === 'diamonds') {
    return (
      <img src="/games/giftbox/assets/coin.png" className="w-full h-full object-contain" />
    );
  }
  if (type === 'coins') {
    return (
      <img src="/games/giftbox/assets/coin.png" className="w-full h-full object-contain" />
    );
  }
};

// --- BOTÃO JUICY ---
export const JuicyButton = ({ children, onClick, disabled, variant = "green" }: any) => {
  const styles: any = {
    green: "bg-[#00d000] border-[#007c00] text-white shadow-[0_4px_0_#005900]",
    blue: "bg-[#338aff] border-[#004bbd] text-white shadow-[0_4px_0_#003380]",
    gray: "bg-[#555f6d] border-[#363d45] text-[#aeb5bc] shadow-[0_4px_0_#252a30]",
  };
  
  const activeStyle = disabled ? styles.gray : styles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative max-w-40 w-full py-2 rounded-sm border-b-4 font-black uppercase tracking-wide transition-all select-none flex items-center justify-center gap-2 text-md -skew-x-8
        ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 active:translate-y-1 active:shadow-none"}
        ${activeStyle}
      `}
      style={{
        textShadow: "1px 1px 0 black",
        WebkitTextStroke: "0.5px black",
        }}
    >
      <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-lg pointer-events-none" />
      <span className="relative z-10 truncate px-1 skew-x-8">{children}</span>
    </button>
  );
};