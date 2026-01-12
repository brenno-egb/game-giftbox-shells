"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

import GiftboxChestRive from "@/@games/templates/giftbox/animation";
import { getSkinByChest } from "@/@games/templates/giftbox/chest/chest.helpers";
import { resolveChestTheme } from "@/@games/templates/giftbox/chest/chest.theme";
import type { ChestItem } from "@/@games/templates/giftbox/chest/chest.types";
import { CurrencyIcon } from "./ChestComponents";

type Props = {
  chest: ChestItem;
  onClose: () => void;
  onBuy: () => void;
};

export default function ChestPreviewModal({ chest, onClose, onBuy }: Props) {
  const skin = getSkinByChest(chest);
  console.log(skin);
  const theme = resolveChestTheme("buyable", skin?.theme);

  const canAfford = chest.canAfford ?? true;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Container do Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="relative w-full max-w-sm rounded-[20px] overflow-hidden flex flex-col"
        style={{
          backgroundImage: `
            url(${skin?.assetsBase}/${skin?.backgroundStore}), 
            linear-gradient(to top, ${
              theme.panelBorder || theme.accent
            } 0%, transparent 60%)
          `,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",
          borderWidth: "4px",
          borderStyle: "solid",
          borderColor: "transparent",
          boxShadow: `0 0 40px -20px ${theme.accentGlow}`,
        }}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="absolute w-full h-full top-0 left-0 z-10 backdrop-blur-[3px] bg-black/40" />

        {/* --- ÁREA DE SHOWCASE (Topo) --- */}
        <div className="relative h-64 w-full flex items-center justify-center overflow-hidden z-10 shrink-0">
          {/* ITEM (Rive ou Imagem) */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 mb-12">
            {skin?.rivePath ? (
              <div className="w-full h-full transform scale-125 translate-y-4">
                <GiftboxChestRive
                  path={skin.rivePath}
                  isOpen={true}
                  triggerFinal={true}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <motion.div
                animate={{ y: [-8, 8, -8], rotate: [0, 2, -2, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-40 h-40"
              >
                {chest.image ? (
                  <Image
                    src={chest.image}
                    alt={chest.name}
                    fill
                    className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  />
                ) : (
                  <div className="text-8xl flex items-center justify-center h-full">
                    📦
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* --- ÁREA DE INFO E AÇÃO (Base) --- */}
        <div className="px-6 pb-6 pt-2 text-center space-y-5 relative z-20 flex flex-col items-center">
          {/* Título e Descrição */}
          <div>
            <h2
              className="text-3xl font-black text-white uppercase italic tracking-wider drop-shadow-md leading-none"
              style={{
                textShadow: "2px 2px 0 black",
                WebkitTextStroke: "1px black",
              }}
            >
              {chest.name}
            </h2>
          </div>

          {/* Container de Preço e Botão */}
          <div className="w-full space-y-5">
            {/* PRICE TAG (Com o novo ícone) */}
            <div className="flex justify-center mt-2">
              <div className="relative flex items-center gap-2 px-6 py-2.5 rounded-md bg-black/70">
                {/* Container do ícone flutuando para fora */}
                <div className="absolute -left-4 top-0 w-12 h-12 z-20 scale-150">
                  <CurrencyIcon type={chest.purchase_type} />
                </div>

                <span className="min-w-16 font-black text-2xl pl-6 text-white tracking-tight">
                  {chest.price}
                </span>
              </div>
            </div>

            {/* Botão de Compra (Estilo Cards) */}
            <button
              onClick={onBuy}
              disabled={!canAfford}
              className={`
                  relative w-full py-3.5 rounded-lg border-b-[5px] font-black uppercase tracking-tight text-xl text-white transition-all select-none
                  ${
                    !canAfford
                      ? "opacity-90 grayscale cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1.5"
                  }
                `}
              style={{
                backgroundColor: canAfford ? theme.accent : "#555f6d",
                borderColor: canAfford ? theme.accentBorder : "#363d45",
                boxShadow: `0 4px 10px ${
                  canAfford
                    ? theme.accentGlow === "transparent"
                      ? "rgba(0,0,0,0.4)"
                      : theme.accentGlow
                    : "rgba(0,0,0,0.4)"
                }`,
                textShadow: "1px 1px 0 black",
                WebkitTextStroke: "0.5px black",
              }}
            >
              {/* Shine Overlay */}
              <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-md pointer-events-none" />

              <span className="relative z-10">
                {canAfford ? "COMPRAR AGORA" : "BLOQUEADO"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
