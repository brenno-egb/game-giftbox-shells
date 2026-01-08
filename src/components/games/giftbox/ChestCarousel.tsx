"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

// Ajuste os imports conforme seu caminho real
import { giftboxSkins } from "@/games/templates/giftbox/skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import {
  getGameUrl,
  getGameSpins,
} from "@/games/templates/giftbox/chest/chest.helpers";

// --- SUB-COMPONENTES DE UI ---

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
    yellow: "bg-[#ffc800] border-[#B5862F] text-white shadow-[0_6px_0_#00000070,0_10px_0_#00000031]",
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
      <div className="absolute w-full h-2 top-0 left-0 bg-[#ffd23f]"/>
      <div className="absolute w-full h-2 bottom-0 left-0 bg-[#C4A023]"/>
      {/* <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/20 rounded-t-xl pointer-events-none" /> */}
      <div className="flex items-center justify-center gap-2 relative z-10 -skew-x-4">
        {children}
      </div>
    </button>
  );
};

// --- CARD DO BAÚ (Isolado para limpeza) ---

const ChestCard = ({
  item,
  visualOffset,
  isActive,
}: {
  item: any;
  visualOffset: number;
  isActive: boolean;
}) => {
  // Configuração visual baseada na posição (Centro vs Laterais)
  const styles = isActive
    ? {
        transform: `translateX(0) scale(1) rotateY(0deg)`,
        opacity: 1,
        zIndex: 50,
        filter: "brightness(1)",
        border: "border-none",
        shadow: "shadow-none",
      }
    : {
        transform: `translateX(${visualOffset * 200}px) scale(0.75) rotateY(${
          visualOffset * -20
        }deg)`,
        opacity: 0.5,
        zIndex: 10,
        filter: "brightness(0.5) blur(1px) grayscale(0.6)",
        border: "border-[#4a4a4a]",
        shadow: "shadow-2xl",
      };

  return (
    <div
      className="absolute top-0 left-0 right-0 mx-auto w-70 h-90 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        transform: styles.transform,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        filter: styles.filter,
      }}
    >
      {/* Sombra de chão (Apenas no ativo) */}
      {isActive && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black/40 blur-xl rounded-[100%]" />
      )}

      {/* Container Principal do Card */}
      <div
        className={`relative w-full h-full rounded-[24px] border-[6px] overflow-hidden ${styles.border} ${styles.shadow}`}
      >

        {/* Título do Jogo */}
        <div className="absolute top-5 inset-x-0 text-center z-20 px-4">
          <h3
            className="text-white font-black uppercase text-xl leading-tight drop-shadow-md"
            style={{ WebkitTextStroke: "1px black" }}
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
            />
          </div>
        </div>

        {/* Rodapé do Card (Info) */}
        <div className="absolute bottom-0 inset-x-0 py-3 flex flex-col items-center  z-20">
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

export default function SupercellChestCarousel({ games, uid, lang }: Props) {
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
      if (next < 0) return chests.length - 1;
      if (next >= chests.length) return 0;
      return next;
    });
  };

  if (!chests.length) return <EmptyStateToon />;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 1. HEADER (Contador) - Agora é flex item, não absolute */}
      <div className="absolute top-0 flex flex-col items-center z-20 animate-slideDown">
        <div className="">
          <div className="bg-[#866700] text-white text-xl font-black px-2 py-0.5 rounded-md shadow-sm border border-[#665300]">
            {chests.length}
          </div>
        </div>
      </div>

      {/* 2. PALCO DO CARROSSEL (Container Relativo apenas para os cards 3D) */}
      {/* A altura fixa (h-[400px]) é necessária AQUI para o 3D funcionar, mas não no componente todo */}
      <div className="relative w-full h-95 flex items-center justify-center perspective-[1000px] overflow-visible">
        {chests.map((chest, i) => {
          const offset = i - activeIndex;

          // Lógica de loop infinito visual
          let visualOffset = offset;
          if (activeIndex === 0 && i === chests.length - 1) visualOffset = -1;
          if (activeIndex === chests.length - 1 && i === 0) visualOffset = 1;

          // Renderizar apenas os vizinhos para performance
          if (Math.abs(visualOffset) > 1 && chests.length > 2) return null;

          return (
            <div
              key={chest.skinId}
              className="absolute inset-0 flex items-center justify-center pointer-events-none" // pointer-events-none no wrapper para não bloquear cliques
            >
              <div
                className="pointer-events-auto cursor-pointer" // Reativa cliques no card
                onClick={() => visualOffset !== 0 && navigate(visualOffset)}
              >
                <ChestCard
                  item={chest}
                  visualOffset={visualOffset}
                  isActive={visualOffset === 0}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CONTROLES E AÇÕES (Botões ao lado) */}
      <div className="flex items-center justify-center gap-4 md:gap-8 z-30 w-full px-4">
        {/* Botão Anterior (Esquerda) */}
        {chests.length > 1 ? (
          <JuicyButton
            variant="yellow"
            onClick={() => navigate(-1)}
            className="max-w-14 flex items-center justify-center shrink-0"
            title="Anterior"
          >
            <svg width="30" height="43" viewBox="0 0 30 43" fill="none" xmlns="http://www.w3.org/2000/svg" className="-rotate-180">
              <path d="M28.0011 23.902L4.83292 41.6437C2.86033 43.1542 -0.000931937 41.7602 3.0754e-06 39.289L0.0137407 2.98086C0.0146873 0.479131 2.93921 -0.905675 4.90045 0.666943L28.0548 19.2333C29.5611 20.4411 29.5348 22.7275 28.0011 23.902Z" fill="black"/>
            </svg>
          </JuicyButton>
        ) : (
          /* Placeholder invisível para manter o botão centralizado se tiver apenas 1 item */
          <div className="w-14 h-14 hidden md:block" />
        )}

        {/* Botão de Ação Principal (Centro) */}
        <div className="relative group shrink-0">
          <JuicyButton
            variant="yellow"
            onClick={() =>
              (window.location.href = getGameUrl(activeChest.skinId, uid, lang))
            }
            className="px-8 md:px-16 py-6 text-2xl! min-w-50 relative z-10"
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

        {/* Botão Próximo (Direita) */}
        {chests.length > 1 ? (
          <JuicyButton
            variant="yellow"
            onClick={() => navigate(1)}
            className="max-w-14 flex items-center justify-center shrink-0"
            title="Próximo"
          >
            <svg width="30" height="43" viewBox="0 0 30 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M28.0011 23.902L4.83292 41.6437C2.86033 43.1542 -0.000931937 41.7602 3.0754e-06 39.289L0.0137407 2.98086C0.0146873 0.479131 2.93921 -0.905675 4.90045 0.666943L28.0548 19.2333C29.5611 20.4411 29.5348 22.7275 28.0011 23.902Z" fill="black"/>
            </svg>
          </JuicyButton>
        ) : (
          /* Placeholder invisível */
          <div className="w-14 h-14 hidden md:block" />
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

// --- Empty State ---
function EmptyStateToon() {
  return (
    <div className="w-full max-w-lg mx-auto bg-[#1a233a] rounded-3xl border-4 border-[#2d3548] p-8 text-center shadow-xl relative overflow-hidden my-8">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl mb-4 grayscale opacity-50 animate-bounce">
          🔒
        </div>
        <h2 className="text-2xl font-black text-white uppercase mb-2">
          Inventário Vazio
        </h2>
        <p className="text-slate-400 mb-6 max-w-xs mx-auto">
          Não há baús disponíveis no momento. Jogue para conquistar recompensas!
        </p>
        <JuicyButton
          variant="blue"
          onClick={() => (window.location.href = "/shop")}
        >
          Ir para a Loja
        </JuicyButton>
      </div>
    </div>
  );
}
