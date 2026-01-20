"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

import type { PurchaseError } from "@/@sdk/smartico";
import type { ChestItem } from "@/@games/templates/giftbox/chest";
import GiftboxChestRive from "@/@games/templates/giftbox/animation";
import { getSkinByChest } from "@/@games/templates/giftbox/chest/chest.helpers";
import { resolveChestTheme } from "@/@games/templates/giftbox/chest/chest.theme";

import { CurrencyIcon } from "./ChestComponents";
import { ErrorToast } from "./ErrorToast";
import { UserProfile } from "@/@sdk/smartico/domain/domain.type";
import { getUserBalance } from "@/@games/templates/giftbox/chest/chest.rules";

type Props = {
  chest: ChestItem;
  userProfile: UserProfile;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: PurchaseError | null;
  onRetry?: () => void;
  onCloseToast?: () => void;
  prizes?: any[];
};

function PrizeOrbit({ prizes }: { prizes: any[] }) {
  const items = prizes.slice(0, 12);
  const [t, setT] = useState(0);
  const special = [
    46015, // banca 5000 - bronze
    46020, // banca 10000 - prata
    46021, // banca 20000 - ouro
    46022, // banca 40000 - esmeralda
    46023, // banca 80000 - diamante
    46484, // banca 160000 - black diamond

  ]

  useEffect(() => {
    let raf: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setT((v) => v + dt * 0.00025);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rx = 120;
  const ry = 42;

  return (
    <div className="pointer-events-none absolute top-27 w-full flex justify-center mr-5">
      {/* Itens de TRÁS */}
      <div className="relative w-0 h-0" style={{ zIndex: 5 }}>
        {items.map((prize, i) => {
          const baseAngle = (i / items.length) * Math.PI * 2;
          const angle = baseAngle + t;
          const sinAngle = Math.sin(angle);

          if (sinAngle > 0) return null;

          const x = Math.cos(angle) * rx;
          const y = sinAngle * ry;
          const depth = (sinAngle + 1) / 2;
          const scale = 1 + depth * 0.55;
          const opacity = 0.35 + depth * 0.65;

          return (
            <div
              key={`back-${prize.id}-${i}`}
              className="absolute will-change-transform"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                opacity,
              }}
            >
              <div className="relative w-8 h-8">
                {prize.icon ? (
                  <Image
                    src={prize.icon}
                    alt={prize.name}
                    fill
                    className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-sm">
                    🎁
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Itens da FRENTE */}
      <div className="relative w-0 h-0" style={{ zIndex: 40 }}>
        {items.map((prize, i) => {
          const baseAngle = (i / items.length) * Math.PI * 2;
          const angle = baseAngle + t;
          const sinAngle = Math.sin(angle);

          if (sinAngle <= 0) return null;

          const x = Math.cos(angle) * rx;
          const y = sinAngle * ry;
          const depth = (sinAngle + 1) / 2;
          const scale = 1 + depth * 0.55;
          const opacity = 0.35 + depth * 0.65;

          return (
            <div
              key={`front-${prize.id}-${i}`}
              className="absolute will-change-transform"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                opacity,
              }}
            >
              <div className={`relative w-8 h-8 flex flex-col transition-all duration-300 ${(special.includes(prize.id)) ? 'shadow-md shadow-yellow-500 border border-yellow-400 rounded-md scale-130' : ''} `}>
                {prize.icon ? (
                  <Image
                    src={prize.icon}
                    alt={prize.name}
                    fill
                    className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-sm">
                    🎁
                  </div>
                )}
                <div className="w-full text-[7px] whitespace-nowrap truncate">
                  {prize.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PurchaseConfirmModal({
  chest,
  userProfile,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
  onRetry,
  onCloseToast,
  prizes,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const skin = getSkinByChest(chest);
  const theme = resolveChestTheme("buyable", skin?.theme);

  const canBuy = chest.can_buy;
  const canAfford = chest.canAfford;

  const showCancelButton = canBuy && canAfford;

  const confirmLabel = !canBuy
    ? "BLOQUEADO"
    : !canAfford
      ? "SEM SALDO"
      : "CONFIRMAR";

  const confirmDisabled = isLoading || !!error || !canBuy || !canAfford;

  const userBalance = getUserBalance(userProfile, chest.purchase_type);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <>
      <ErrorToast error={error} onClose={onCloseToast || onClose} />

      <div className="fixed inset-0 z-100 flex items-center justify-center px-4 font-sans pt-12">
        <div
          onClick={!isLoading ? onClose : undefined}
          className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          } ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
        />

        <div className="relative w-full flex flex-col items-center">
          <div
            className={`absolute w-full -top-25 flex justify-center items-center text-sm z-100 transition-all pointer-events-none duration-200 ${
              isVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-80 opacity-0 translate-y-5"
            }`}
          >
            <div className="flex items-center gap-4 py-1 px-3 border-2 border-gray-600 bg-gray-800 rounded-sm drop-shadow-[0px_2px_0px_rgba(11,11,11)]">
              <div className="w-8 h-8 drop-shadow-[2px_2px_2px_rgba(0,0,0)]">
                <img src={userProfile.avatar_url} alt="" />
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="w-4 h-4 drop-shadow-[1px_1px_1px_rgba(0,0,0)]">
                  <CurrencyIcon type={chest.purchase_type} />
                </div>
                <span
                  className="text-white text-lg font-bold"
                  style={{
                    textShadow: "1px 1px 0 black",
                    WebkitTextStroke: "1px black",
                  }}
                >
                  {userBalance}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`absolute -top-22 h-58 w-full flex items-center justify-center z-10 shrink-0 pointer-events-none transition-all duration-300 ${
              isVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-80 opacity-0 translate-y-5"
            }`}
          >
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {skin?.rivePath ? (
                <div className="w-full h-full transform scale-125 translate-y-4">
                  <GiftboxChestRive
                    path={skin.rivePath}
                    isOpen={false}
                    triggerFinal={false}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative w-40 h-40 animate-float">
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
                </div>
              )}
            </div>
          </div>
          {prizes && prizes.length > 0 && <PrizeOrbit prizes={prizes} />}

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
              boxShadow: `0 0 40px -20px ${theme.accentGlow}`,
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {!isLoading && (
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
            )}

            <div className="absolute w-full h-full top-0 left-0 z-10 backdrop-blur-[3px] bg-black/40" />

            <div className="relative h-45 w-full"></div>

            <div className="px-6 pb-6 pt-2 text-center space-y-4 relative z-20 flex flex-col items-center">
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

              {canAfford && (
                <div className="w-full">
                  <div className="flex justify-center items-center text-sm">
                    <div className="relative flex justify-end items-center gap-2 bg-black/60 pb-0.5 pl-6 pr-2 rounded-sm">
                      <div className="absolute -left-3 w-7.5 h-7.5">
                        <CurrencyIcon type={chest.purchase_type} />
                      </div>
                      <span
                        className="text-white text-xl font-bold"
                        style={{
                          textShadow: "2px 2px 0 black",
                          WebkitTextStroke: "0.5px black",
                        }}
                      >
                        {chest.price} chave{Number(chest.price) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full pt-2">
                <div
                  className={`flex gap-3 ${
                    showCancelButton ? "" : "justify-center"
                  }`}
                >
                  {/* {showCancelButton && (
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className={`
                        flex-1 py-3 px-1 rounded-lg border-b-4 font-black uppercase text-md
                        transition-all
                        ${
                          isLoading
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1"
                        }
                    `}
                      style={{
                        backgroundColor: "#555f6d",
                        borderColor: "#363d45",
                        color: "white",
                        textShadow: "1px 1px 0 black",
                        WebkitTextStroke: "0.5px gray",
                      }}
                    >
                      Cancelar
                    </button>
                  )} */}

                  <button
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    className={`
                  relative w-full py-3.5 px-1 rounded-lg border-b-[5px] font-black uppercase tracking-tight text-xl text-white transition-all select-none
                  ${
                    !canAfford
                      ? "opacity-90 grayscale cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1.5"
                  }
                `}
                    style={{
                      backgroundColor: canAfford ? theme.accent : "#555f6d",
                      borderColor: canAfford ? theme.accentBorder : "#363d45",
                      textShadow: "1px 1px 0 black",
                      WebkitTextStroke: "0.5px black",
                    }}
                  >
                    <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-md pointer-events-none" />

                    <span className="relative z-10">
                      {isLoading ? "COMPRANDO..." : confirmLabel}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(-8px) rotate(0deg);
            }
            25% {
              transform: translateY(8px) rotate(2deg);
            }
            75% {
              transform: translateY(8px) rotate(-2deg);
            }
          }

          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
            
        `}</style>
      </div>
    </>
  );
}
