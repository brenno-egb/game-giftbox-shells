"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GiftboxChestRive from "@/@games/templates/giftbox/animation";
import { getSkinByChest, getGameUrl } from "@/@games/templates/giftbox/chest/chest.helpers";
import { resolveChestTheme } from "@/@games/templates/giftbox/chest/chest.theme";
import type { ChestItem } from "@/@games/templates/giftbox/chest/chest.types";

type Props = {
  chest: ChestItem;
  onClose: () => void;
  onPlayNow: () => void;
  uid: string;
  lang: string;
};

export default function PurchaseSuccessModal({
  chest,
  onClose,
  onPlayNow,
  uid,
  lang,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const skin = getSkinByChest(chest);
  const theme = resolveChestTheme("ready", skin?.theme);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Container do Modal - MANTENDO ESTILO ORIGINAL */}
      <div
        className={`relative w-full max-w-sm rounded-[20px] overflow-hidden flex flex-col transition-all duration-300 ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-80 opacity-0 translate-y-5"
        }`}
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
          boxShadow: `0 0 60px -10px ${theme.accentGlow}`,
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Overlay - MANTENDO ESTILO ORIGINAL */}
        <div className="absolute w-full h-full top-0 left-0 z-10 backdrop-blur-[3px] bg-black/40" />

        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: [
                  "#FFD700",
                  "#00d000",
                  "#FF6B6B",
                  "#4ECDC4",
                  "#95E1D3",
                ][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative h-64 w-full flex items-center justify-center overflow-hidden z-30 shrink-0">
          {/* Badge de Sucesso */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-green-500/20 rounded-full px-4 py-2 flex items-center gap-2 border-2 border-green-400">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-400 font-black text-sm uppercase">
                Adquirido!
              </span>
            </div>
          </div>

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
              <div className="relative w-40 h-40 animate-float-success">
                {chest.image ? (
                  <Image
                    src={chest.image}
                    alt={chest.name}
                    fill
                    className="object-contain drop-shadow-[0_10px_30px_rgba(0,208,0,0.4)]"
                  />
                ) : (
                  <div className="text-7xl flex items-center justify-center h-full">
                    ✅
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Glow Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentGlow}, transparent 70%)`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* --- ÁREA DE INFO E AÇÃO (Base) - MANTENDO ESTILO ORIGINAL --- */}
        <div className="px-6 pb-6 pt-2 text-center space-y-4 relative z-30 flex flex-col items-center">
          {/* Título */}
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
            <p className="text-white/60 text-sm mt-2">
              O baú foi adicionado ao seu inventário
            </p>
          </div>

          {/* Botões de Ação - MANTENDO ESTILO ORIGINAL */}
          <div className="space-y-3 w-full">
            {/* Jogar Agora */}
            <button
              onClick={onPlayNow}
              className={`
                w-full py-3.5 rounded-lg border-b-[5px] font-black uppercase text-lg
                relative overflow-hidden
                hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1.5
                transition-all
              `}
              style={{
                backgroundColor: theme.accent,
                borderColor: theme.accentBorder,
                color: "white",
                textShadow: "1px 1px 0 black",
                WebkitTextStroke: "0.5px black",
                boxShadow: `0 4px 10px ${theme.accentGlow}`,
              }}
            >
              {/* Shine Overlay */}
              <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-md pointer-events-none" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                Jogar Agora
              </span>
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className={`
                w-full py-3 rounded-lg border-b-4 font-bold uppercase text-sm
                hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1
                transition-all
              `}
              style={{
                backgroundColor: "#555f6d",
                borderColor: "#363d45",
                color: "white",
                textShadow: "1px 1px 0 black",
              }}
            >
              Continuar Navegando
            </button>
          </div>
        </div>
      </div>

      {/* Animações - MANTENDO ESTILO ORIGINAL */}
      <style jsx>{`
        @keyframes float-success {
          0%,
          100% {
            transform: translateY(-12px) rotate(-3deg) scale(1.05);
          }
          50% {
            transform: translateY(12px) rotate(3deg) scale(1.1);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-float-success {
          animation: float-success 2s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}