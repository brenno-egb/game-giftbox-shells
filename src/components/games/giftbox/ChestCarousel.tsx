"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

// Ajuste os imports conforme seu caminho real
import { giftboxSkins } from "@/@games/templates/giftbox/skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import {
  getGameUrl,
  getGameSpins,
} from "@/@games/templates/giftbox/chest/chest.helpers";
import { EmptyState } from "./shared/StateComponents";

// ... (MANTENHA OS COMPONENTES JuicyButton E ChestCard IGUAIS AO SEU CÓDIGO) ...
// Vou ocultar aqui para focar na correção, mas você deve manter o código deles.

interface JuicyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "green" | "yellow" | "blue";
}

const JuicyButton = ({
  children,
  className = "",
  variant = "green",
  ...props
}: JuicyButtonProps) => {
  const styles = {
    green: "bg-[#00d000] border-[#007c00] text-white shadow-[0_6px_0_#005900]",
    yellow:
      "bg-[#ffc800] border-[#B5862F] text-white shadow-[0_6px_0_#00000070,0_10px_0_#00000031]",
    blue: "bg-[#338aff] border-[#004bbd] text-white shadow-[0_6px_0_#003380]",
  };

  return (
    <button
      className={`
        relative px-6 py-3 border-2 skew-x-4
        font-black text-xl uppercase tracking-wide transition-all select-none
        hover:scale-105 hover:brightness-110 
        active:scale-95 active:translate-y-[4px] active:shadow-none
        disabled:opacity-50 disabled:grayscale
        ${styles[variant]} 
        ${className}
      `}
      style={{
        textShadow:
          variant === "yellow"
            ? "0 1px 0 rgba(255,255,255,0.4)"
            : "0 2px 0 rgba(0,0,0,0.3)",
      }}
      {...props}
    >
      <div className="absolute w-full h-2 top-0 left-0 bg-[#ffd23f]" />
      <div className="absolute w-full h-2 bottom-0 left-0 bg-[#C4A023]" />
      <div className="flex items-center justify-center gap-2 relative z-10 -skew-x-4">
        {children}
      </div>
    </button>
  );
};

const ChestCard = ({
  item,
  visualOffset,
}: {
  item: any;
  visualOffset: number;
}) => {
  const dist = Math.abs(visualOffset);
  const isActive = dist === 0;

  const rotateY = visualOffset * -25;
  const translateX = visualOffset * 220; // Espaçamento entre cards
  const scale = 1 - dist * 0.25; // Diminui 25% a cada passo
  const opacity = dist > 1 ? 0 : 1 - dist * 0.4; // Vizinhos ficam semi-transparentes, distantes somem
  const zIndex = 100 - dist; // Quem está perto tem z-index maior (CRUCIAL)

  // Filtros visuais
  const filter = isActive
    ? "brightness(1) blur(0px) grayscale(0)"
    : "brightness(0.5) blur(2px) grayscale(0.8)";

  const borderStyle = isActive
    ? "border-none shadow-none"
    : "border-[#4a4a4a] shadow-2xl";

  return (
    <div
      className="absolute top-0 left-0 right-0 mx-auto w-70 h-90 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
        opacity: opacity,
        zIndex: zIndex,
        filter: filter,
        // Se estiver muito longe, esconde pointer events para não clicar no invisível
        pointerEvents: dist > 1 ? "none" : "auto",
        visibility: dist > 2 ? "hidden" : "visible", // Otimização de render
      }}
    >
      {/* Sombra de chão (Apenas no ativo) */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black/40 blur-xl rounded-[100%] transition-opacity duration-500"
        style={{ opacity: isActive ? 1 : 0 }}
      />

      {/* Container Principal do Card */}
      <div
        className={`relative w-full h-full rounded-3xl border-[6px] overflow-hidden transition-all duration-500 ${borderStyle}`}
      >
        {/* Título do Jogo */}
        <div className="absolute top-5 inset-x-0 text-center z-20 px-4">
          <h3
            className="text-white font-black uppercase text-2xl italic leading-tight drop-shadow-md"
            style={{
              textShadow: "2px 2px 0 black",
              WebkitTextStroke: "1px black",
            }}
          >
            {item.game.name}
          </h3>
        </div>

        {/* Imagem do Baú */}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-8 pt-12">
          <div
            className={`relative w-full h-full ${
              isActive ? "animate-[float_4s_ease-in-out_infinite]" : ""
            }`}
          >
            <Image
              src={item.game.thumbnail}
              alt={item.game.name}
              fill
              className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 768px) 300px, 400px"
            />
          </div>
        </div>

        {/* Rodapé do Card (Info) */}
        <div className="absolute bottom-0 inset-x-0 py-3 flex flex-col items-center z-20">
          <span className="text-[#a8b5cc] text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5">
            Quantidade
          </span>
          <span
            className="text-white font-black text-3xl leading-none drop-shadow-lg"
            style={{ WebkitTextStroke: "1.5px black" }}
          >
            {item.spins}x
          </span>
        </div>
      </div>
    </div>
  );
};
// --- COMPONENTE PRINCIPAL ---

type Props = {
  games: MiniGameTemplate[];
  uid: string;
  lang: string;
};

export default function ChestCarousel({ games, uid, lang }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filtra e prepara os dados
  const chests = useMemo(() => {
    return Object.entries(giftboxSkins)
      .map(([skinId, skinData]) => {
        const game = games.find(
          (g) => Number(g.id) === Number(skinData.templateId)
        );
        if (!game) return null;
        const spins = getGameSpins(game);
        if (spins <= 0) return null;
        return { skinId, skinData, game, spins };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [games]);

  const activeChest = chests[activeIndex];

  const navigate = (direction: number) => {
    setActiveIndex((prev) => {
      const next = prev + direction;
      // Loop infinito real
      if (next < 0) return chests.length - 1;
      if (next >= chests.length) return 0;
      return next;
    });
  };

  if (!chests.length) return <EmptyState />;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 2. PALCO DO CARROSSEL */}
      <div className="relative w-full h-95 flex items-center justify-center perspective-[1000px] overflow-visible">
        {/* 1. HEADER (Contador) */}
        <div className="absolute w-[65%] flex justify-end -top-6 z-20 animate-slideDown">
          <div className="w-8  rotate-20">
            <div className="bg-[#7a5e00] text-white text-xl font-black px-2 py-0.5 rounded-md shadow-sm border border-black">
              {chests.length}
            </div>
          </div>
        </div>
        {chests.map((chest, i) => {
          const length = chests.length;

          let visualOffset = i - activeIndex;

          if (visualOffset > length / 2) visualOffset -= length;
          if (visualOffset < -length / 2) visualOffset += length;

          return (
            <div
              key={chest.skinId}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto cursor-pointer"
                onClick={() => visualOffset !== 0 && navigate(visualOffset)}
              >
                <ChestCard item={chest} visualOffset={visualOffset} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CONTROLES */}
      <div className="flex items-center justify-center gap-4 z-30 w-full px-4">
        {/* Botão Anterior */}
        {chests.length > 1 ? (
          <JuicyButton
            variant="yellow"
            onClick={() => navigate(-1)}
            className="max-w-14 flex items-center justify-center shrink-0"
            title="Anterior"
          >
            {/* SVG Seta Esquerda */}
            <svg
              width="30"
              height="43"
              viewBox="0 0 30 43"
              fill="none"
              className="-rotate-180"
            >
              <path
                d="M28.0011 23.902L4.83292 41.6437C2.86033 43.1542 -0.000931937 41.7602 3.0754e-06 39.289L0.0137407 2.98086C0.0146873 0.479131 2.93921 -0.905675 4.90045 0.666943L28.0548 19.2333C29.5611 20.4411 29.5348 22.7275 28.0011 23.902Z"
                fill="black"
              />
            </svg>
          </JuicyButton>
        ) : (
          <div className="w-14 h-14 hidden" />
        )}

        {/* Botão ABRIR */}
        <div className="relative group shrink-0">
          <JuicyButton
            variant="yellow"
            onClick={() =>
              (window.location.href = getGameUrl(activeChest.skinId, uid, lang))
            }
            className="px-8 py-6 text-2xl! min-w-50 relative z-10"
          >
            <span
              className="text-white font-black"
              style={{
                textShadow: "2px 2px 0 black",
                WebkitTextStroke: "1px black",
              }}
            >
              ABRIR
            </span>
          </JuicyButton>
        </div>

        {/* Botão Próximo */}
        {chests.length > 1 ? (
          <JuicyButton
            variant="yellow"
            onClick={() => navigate(1)}
            className="max-w-14 flex items-center justify-center shrink-0"
            title="Próximo"
          >
            {/* SVG Seta Direita */}
            <svg width="30" height="43" viewBox="0 0 30 43" fill="none">
              <path
                d="M28.0011 23.902L4.83292 41.6437C2.86033 43.1542 -0.000931937 41.7602 3.0754e-06 39.289L0.0137407 2.98086C0.0146873 0.479131 2.93921 -0.905675 4.90045 0.666943L28.0548 19.2333C29.5611 20.4411 29.5348 22.7275 28.0011 23.902Z"
                fill="black"
              />
            </svg>
          </JuicyButton>
        ) : (
          <div className="w-14 h-14 hidden" />
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(-8px) rotate(0deg);
          }
          50% {
            transform: translateY(8px) rotate(1deg);
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

