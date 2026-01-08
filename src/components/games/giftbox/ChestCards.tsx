"use client";

import Image from "next/image";
import { CurrencyIcon } from "./ChestComponents";
import { getSkinByChest } from "@/games/templates/giftbox/chest/chest.helpers";
import { resolveChestTheme } from "@/games/templates/giftbox/chest/chest.theme";

export type ChestCardProps = {
  status: "ready" | "buyable" | "locked";
  name: string;
  ribbon?: string | null;
  imageInner?: string;
  imageBackground?: string;
  backgroundColor: string;
  priceLabel: string | number;
  currencyType?: string;
  spinsAvailable: number;
  index: number;
  onClick: () => void;
  onActionClick: (e: any) => void;
  chest: any;
};

// --- CARD COMPACT ---
export const ChestCardCompact = ({
  status,
  name,
  imageInner,
  imageBackground,
  backgroundColor,
  priceLabel,
  currencyType,
  spinsAvailable,
  index,
  onClick,
  onActionClick,
  chest,
}: ChestCardProps) => {
  const isLocked = status === "locked";
  const isReady = status === "ready";
  const canAfford = status === "buyable";

  // Resolve Cores
  const skin = getSkinByChest(chest);
  const theme = resolveChestTheme(status, skin?.theme);

  return (
    <div
      className="relative group h-full animate-fadeInUp min-h-56"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      {/* CARD CONTAINER */}
      <div
        className={`
    relative flex flex-col items-center p-2 rounded-xl shadow-lg h-full overflow-hidden
    transition-transform duration-200 active:scale-95 
    ${!isLocked ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : ""}
  `}
        style={{
          backgroundImage: `
      linear-gradient(${theme.panelBg}, ${
            theme.panelBg
          }), 
      linear-gradient(to top, ${
        theme.panelBorder || theme.accent
      } 0%, transparent 60%)
    `,
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",

          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: "transparent",

          boxShadow: `0 1px 1px -3px ${theme.accentGlow}`,
        }}
      >
        {/* Background Imagem */}
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

        {/* Imagem do Baú */}
        <div className="relative w-24 h-24 mb-2 z-10">
          <div
            className={`relative w-full h-full transition-all duration-300 ${
              isLocked
                ? "opacity-90"
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

        {/* Textos */}
        <div className="relative w-full mt-2 mb-3 z-10 flex flex-col items-center gap-2">
          <div className="relative z-10 w-full text-center">
            <h3
              className="text-white font-black uppercase text-xl leading-tight italic drop-shadow-md line-clamp-2"
              style={{
                textShadow: "2px 2px 0 black",
                WebkitTextStroke: "1px black",
              }}
            >
              {name}
            </h3>
          </div>

          <div className="flex justify-center">
            {isReady ? (
              <div className="bg-[#00d000]/20 border border-[#00d000] text-[#00d000] px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide animate-pulse">
                {spinsAvailable} Giros
              </div>
            ) : (
              <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-md border shadow-sm transition-colors bg-black/40 border-white/10">
                <div className="absolute -left-4 -top-1 w-10 h-10">
                  <CurrencyIcon type={currencyType} />
                </div>
                <span className="font-semibold text-md shadow-black drop-shadow-sm pl-3 text-white">
                  {priceLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTÃO (AQUI ESTÁ A CORREÇÃO DE CORES) */}
      <div className="absolute -bottom-3 flex w-full justify-center">
        <button
          onClick={onActionClick}
          disabled={isLocked}
          className={`
      relative max-w-40 py-1 rounded-sm font-black uppercase tracking-wide transition-all select-none flex items-center justify-center gap-2 text-md text-white
      ${
        isLocked
          ? "cursor-not-allowed"
          : "cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 active:translate-y-1 active:shadow-none"
      }
    `}
          style={{
            // 1. GEOMETRIA DA BORDA
            // Definimos o tamanho aqui (1px lados/topo, 4px embaixo para o 3D)
            borderStyle: "solid",
            borderWidth: "1px 1px 4px 1px",
            borderColor: "transparent", // Importante: Transparente para o gradiente aparecer

            // 2. O TRUQUE DO GRADIENTE (Camadas)
            // Camada 1 (Cima): A cor sólida do botão (recortada no padding-box)
            // Camada 2 (Baixo): O gradiente da borda (recortada no border-box)
            backgroundImage: `
        linear-gradient(${theme.accent}, ${theme.accent}), 
        linear-gradient(to top, ${theme.accentBorder} 0%, transparent 100%)
      `,
            backgroundClip: "padding-box, border-box",
            backgroundOrigin: "padding-box, border-box",

            // 3. SOMBRA E TEXTO
            // Ajuste: Sombra leve para destacar o gradiente se necessário
            boxShadow: `0 4px 0 ${
              theme.accentGlow === "transparent"
                ? "rgba(0,0,0,0.2)"
                : theme.accentGlow
            }`,
            textShadow: "1px 1px 0 black",
            WebkitTextStroke: "0.5px black",
          }}
        >
          <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-lg pointer-events-none" />
          <span className="relative z-10 tracking-normal px-3 mt-1">
            {isReady ? "ABRIR" : canAfford ? "COMPRAR" : "BLOQUEADO"}
          </span>
        </button>
      </div>
    </div>
  );
};

// --- CARD WIDE ---
export const ChestCardWide = ({
  status,
  name,
  imageInner,
  imageBackground,
  backgroundColor,
  priceLabel,
  currencyType,
  spinsAvailable,
  index,
  onClick,
  onActionClick,
  chest,
}: ChestCardProps) => {
  // ✅ 1. LÓGICA RESTAURADA
  const isLocked = status === "locked";
  const isReady = status === "ready";
  const canAfford = status === "buyable";

  const skin = getSkinByChest(chest);
  const theme = resolveChestTheme(status, skin?.theme);

  return (
    <div
      className="group h-full animate-fadeInUp col-span-2"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div
        className={`
           relative flex flex-row items-center p-2 md:p-4 rounded-xl shadow-lg overflow-hidden h-full 
           transition-transform duration-200 active:scale-95 
           ${!isLocked ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : ""}
        `}
        style={{
          // ✅ 2. GRADIENTE DE BORDA (Mesma lógica do Compact)
          backgroundImage: `
            linear-gradient(${theme.panelBg || '#242424'}, ${theme.panelBg || '#242424'}), 
            linear-gradient(to top, ${theme.panelBorder || theme.accent} 0%, transparent 40%)
          `,
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",

          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: "transparent",

          boxShadow: `0 1px 1px -3px ${theme.accentGlow}`,
        }}
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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md border shadow-sm transition-colors bg-black/85 border-white/10">
                <div className="absolute -left-4 -top-1 w-10 h-10">
                  <CurrencyIcon type={currencyType} />
                </div>
                <span className="font-semibold text-md shadow-black drop-shadow-sm pl-3 text-white">
                  {priceLabel}
                </span>
              </div>
            )}
          </div>

          {/* BOTÃO WIDE */}
          <button
            onClick={onActionClick}
            disabled={isLocked}
            className={`
              relative max-w-40 w-full py-2 rounded-sm border-b-4 font-black uppercase tracking-wide transition-all select-none flex items-center justify-center gap-2 text-md -skew-x-8 text-white 
              ${isLocked ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 active:translate-y-1 active:shadow-none"}
            `}
            style={{
              backgroundColor: theme.accent,
              borderColor: theme.accentBorder,
              boxShadow: `0 4px 0 ${
                theme.accentGlow === "transparent"
                  ? "#00000040"
                  : theme.accentGlow
              }`,
              textShadow: "1px 1px 0 black",
              WebkitTextStroke: "0.5px black",
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-lg pointer-events-none" />
            {/* ✅ 3. TEXTO CORRIGIDO (Usa canAfford) */}
            <span className="relative z-10 truncate px-1 skew-x-8">
              {isReady ? "ABRIR" : canAfford ? "COMPRAR" : "BLOQUEADO"}
            </span>
          </button>
        </div>

        <div className="relative w-40 h-40 ml-2 z-10">
          {/* ✅ 4. OPACIDADE EM LOCKED NA IMAGEM */}
          <div className={`relative w-full h-full transition-all duration-300 ${isLocked ? "grayscale opacity-100" : "group-hover:scale-110 group-hover:rotate-3"}`}>
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
