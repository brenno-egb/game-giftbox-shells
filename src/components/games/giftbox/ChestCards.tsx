"use client";

import Image from "next/image";
import { CurrencyIcon, JuicyButton } from "./ChestComponents"; // Ajuste o import

// Interface unificada para garantir que ambos recebam os mesmos dados processados
export type ChestCardProps = {
  status: "ready" | "buyable" | "locked";
  name: string;
  ribbon?: string | null;
  imageInner?: string; // A imagem do baú
  imageBackground?: string; // A imagem de fundo (mapa)
  backgroundColor: string; // Cor de fallback
  priceLabel: string | number;
  currencyType?: string;
  spinsAvailable: number;
  index: number;
  onClick: () => void;
  onActionClick: (e: any) => void;
};

// --- CARD COMPACT ---
export const ChestCardCompact = ({
  status,
  name,
  ribbon,
  imageInner,
  imageBackground,
  backgroundColor,
  priceLabel,
  currencyType,
  spinsAvailable,
  index,
  onClick,
  onActionClick,
}: ChestCardProps) => {
  const isLocked = status === "locked";
  const isReady = status === "ready";
  const canAfford = status === "buyable";

  return (
    <div
      className="group h-full animate-fadeInUp"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div
        className={`
        relative flex flex-col items-center p-2 rounded-xl border-[3px] shadow-lg overflow-hidden bg-[#242424] h-full cursor-pointer transition-transform duration-200 active:scale-95
        ${
          isReady
            ? "border-[#00d000] shadow-[#00d000]/10"
            : canAfford
            ? "border-[#338aff] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#338aff]/20"
            : "border-[#4a4a4a]"
        }
      `}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: imageBackground
              ? `url(${imageBackground})`
              : undefined,
            backgroundColor,
          }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:8px_8px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#242424]/50 to-[#242424]" />
        </div>
        {/* 
        {ribbon && (
          <div className="absolute -top-[2px] -right-[2px] z-20">
            <div className="bg-[#ff3b30] text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-xl border-l-2 border-b-2 border-[#b91c1c] shadow-md">
              {ribbon}
            </div>
          </div>
        )} */}

        <div className="relative z-10 w-full text-center mt-1 mb-2 h-10 flex flex-col justify-center">
          <h3
            className="text-white font-black uppercase text-xs leading-tight drop-shadow-md line-clamp-2"
            style={{ WebkitTextStroke: "0.5px black" }}
          >
            {name}
          </h3>
        </div>

        {/* Imagem Compacta */}
        <div className="relative w-24 h-24 mb-2 z-10">
          <div
            className={`relative w-full h-full transition-all duration-300 ${
              isLocked
                ? "grayscale opacity-80"
                : "group-hover:scale-110 group-hover:rotate-3"
            }`}
          >
            {imageInner ? (
              <Image
                src={imageInner}
                alt={name}
                fill
                className="object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                sizes="(max-width: 768px) 100px, 150px"
              />
            ) : (
              <div className="text-5xl flex items-center justify-center h-full">
                📦
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-auto z-10 flex flex-col gap-2">
          <div className="flex justify-center">
            {isReady ? (
              <div className="bg-[#00d000]/20 border border-[#00d000] text-[#00d000] px-2 py-0.5 rounded-lg text-[10px font-black uppercase tracking-wide animate-pulse">
                {spinsAvailable} Giros
              </div>
            ) : (
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1 rounded-md border shadow-sm transition-colors ${
                  canAfford
                    ? "bg-black/40 border-white/10"
                    : "bg-black/60 border-none!"
                }`}
              >
                <div className="absolute -left-4 -top-0 w-8 h-8">
                  <CurrencyIcon type={currencyType} />
                </div>
                <span
                  className={`font-semibold text-md shadow-black drop-shadow-sm pl-3 ${
                    canAfford ? "text-white" : "text-white"
                  }`}
                >
                  {priceLabel}
                </span>
              </div>
            )}
          </div>
          <JuicyButton
            variant={isReady ? "green" : "blue"}
            onClick={onActionClick}
            disabled={isLocked}
          >
            {isReady ? "ABRIR" : canAfford ? "COMPRAR" : "BLOQUEADO"}
          </JuicyButton>
        </div>
      </div>
    </div>
  );
};

// --- CARD WIDE ---
export const ChestCardWide = ({
  status,
  name,
  ribbon,
  imageInner,
  imageBackground,
  backgroundColor,
  priceLabel,
  currencyType,
  spinsAvailable,
  index,
  onClick,
  onActionClick,
}: ChestCardProps) => {
  const isLocked = false;
  const isReady = status === "ready";
  const canAfford = true;

  return (
    <div
      className="group h-full animate-fadeInUp col-span-2"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div
        className={`
        relative flex flex-row items-center p-2 md:p-4 rounded-xl border-[3px] shadow-lg overflow-hidden bg-[#242424] h-full cursor-pointer transition-transform duration-200 active:scale-95
        ${
          isReady
            ? "border-[#00d000] shadow-[#00d000]/10"
            : canAfford
            ? "border-[#338aff] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#338aff]/20"
            : "border-[#4a4a4a]"
        }
      `}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: imageBackground
              ? `url(${imageBackground})`
              : undefined,
            backgroundColor,
          }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:8px_8px]" />
        </div>

        {/* {ribbon && (
            <div className="absolute -top-[2px] -right-[2px] z-20">
              <div className="bg-[#ff3b30] text-white text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-bl-xl border-l-2 border-b-2 border-[#b91c1c] shadow-md">
                {ribbon}
              </div>
            </div>
          )} */}

        <div className="w-full z-10 flex flex-col items-center gap-2">
          <div className="relative z-10 w-full text-center">
            <h3
              className="text-white font-black uppercase italic text-2xl leading-tight drop-shadow-md line-clamp-2"
              style={{
                textShadow: "2px 2px 0 black",
                WebkitTextStroke: "1px black",
              }}
            >
              {name}
            </h3>
          </div>
          <div className="relative flex justify-center mb-2">
            {isReady ? (
              <div className="bg-[#00d000]/20 border border-[#00d000] text-[#00d000] px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide animate-pulse">
                {spinsAvailable} Giros
              </div>
            ) : (
                
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md border shadow-sm transition-colors ${
                    canAfford
                      ? "bg-black/40 border-white/10"
                      : "bg-black/60 border-none!"
                  }`}
                >
                  <div className="absolute -left-4 -top-1 w-10 h-10">
                    <CurrencyIcon type={currencyType} />
                  </div>
                  <span
                    className={`font-semibold text-md shadow-black drop-shadow-sm pl-3 ${
                      canAfford ? "text-white" : "text-white"
                    }`}
                  >
                    {priceLabel}
                  </span>
                </div>
            )}
          </div>
          <JuicyButton
            variant={isReady ? "green" : "blue"}
            onClick={onActionClick}
            disabled={isLocked}
          >
            {isReady ? "ABRIR" : canAfford ? "COMPRAR" : "BLOQUEADO"}
          </JuicyButton>
        </div>
        {/* Imagem Wide (maior) */}
        <div className="relative w-40 h-40 ml-2 z-10">
          <div
            className={`relative w-full h-full transition-all duration-300 ${
              isLocked
                ? "grayscale opacity-80"
                : "group-hover:scale-110 group-hover:rotate-3"
            }`}
          >
            {imageInner ? (
              <Image
                src={imageInner}
                alt={name}
                fill
                className="object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                sizes="(max-width: 768px) 150px, 200px"
              />
            ) : (
              <div className="text-5xl flex items-center justify-center h-full">
                📦
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
