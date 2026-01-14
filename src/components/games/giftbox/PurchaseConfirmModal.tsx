"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import GiftboxChestRive from "@/@games/templates/giftbox/animation";
import { getSkinByChest } from "@/@games/templates/giftbox/chest/chest.helpers";
import { resolveChestTheme } from "@/@games/templates/giftbox/chest/chest.theme";
import type { ChestItem } from "@/@games/templates/giftbox/chest/chest.types";
import { CurrencyIcon } from "./ChestComponents";
import { ErrorToast } from "./ErrorToast";
import type { PurchaseError } from "@/@sdk/smartico/domain/errors/errorHandler";

type Props = {
  chest: ChestItem;
  userBalance: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: PurchaseError | null;
  onRetry?: () => void;
  onCloseToast?: () => void;
};

export default function PurchaseConfirmModal({
  chest,
  userBalance,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
  onRetry,
  onCloseToast,
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

  const balanceAfter = userBalance - chest.price;

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <>
      <ErrorToast error={error} onClose={onCloseToast || onClose} />

      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
        <div
          onClick={!isLoading ? onClose : undefined}
          className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          } ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
        />

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

          <div className="relative h-64 w-full flex items-center justify-center overflow-hidden z-10 shrink-0">
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 mb-12">
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

            {/* Info de Saldo */}
            {canAfford && (
              <div className="w-full bg-black/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Seu Saldo:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{userBalance}</span>
                    <div className="w-5 h-5">
                      <CurrencyIcon type={chest.purchase_type} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Custo:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{chest.price}</span>
                    <div className="w-5 h-5">
                      <CurrencyIcon type={chest.purchase_type} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-bold">Saldo Final:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-black ${
                        balanceAfter >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {balanceAfter}
                    </span>
                    <div className="w-5 h-5">
                      <CurrencyIcon type={chest.purchase_type} />
                    </div>
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
                {showCancelButton && (
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className={`
                        flex-1 py-3 rounded-lg border-b-4 font-black uppercase text-sm
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
                )}

                <button
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  className={`
                        ${showCancelButton ? "flex-1" : "w-full"}
                        py-3 rounded-lg border-b-4 font-black uppercase text-sm
                        relative overflow-hidden transition-all
                        ${
                          confirmDisabled
                            ? "opacity-80 cursor-not-allowed bg-gray-600! border-gray-700!"
                            : "hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1"
                        }
                    `}
                  style={{
                    backgroundColor: theme.accent,
                    borderColor: theme.accentBorder,
                    color: "white",
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
