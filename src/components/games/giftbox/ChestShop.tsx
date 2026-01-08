"use client";

import { useState } from "react";
import Image from "next/image";

import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import { findGameByTemplateId, getGameSpins } from "@/games/templates/giftbox/chest/chest.helpers";
import ChestPreviewModal from "./ChestPreviewModal";


// --- SUB-COMPONENTES VISUAIS ---

const CurrencyIcon = ({ type }: { type?: string }) => {
  if (type === 'gems') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm filter">
        <path d="M7.5 18L3 9l9-7 9 7-4.5 9h-9z" className="fill-emerald-400 stroke-emerald-600 stroke-2" />
        <path d="M3 9h18" className="stroke-emerald-600/50 stroke-1" />
        <path d="M12 2l-3 7 3 9 3-9-3-7z" className="fill-white/30" />
      </svg>
    );
  }
  // Default Coins/Points
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm filter">
      <circle cx="12" cy="12" r="9" className="fill-amber-400 stroke-amber-600 stroke-2" />
      <circle cx="12" cy="12" r="6" className="stroke-amber-600/50 stroke-1" />
      <path d="M12 6v12M6 12h12" className="stroke-amber-600/30" />
    </svg>
  );
};

const JuicyButton = ({ children, onClick, disabled, variant = "green", className = "" }: any) => {
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
        relative w-full py-2 md:py-3 rounded-xl border-b-4 font-black uppercase tracking-wide transition-all select-none flex items-center justify-center gap-2 text-xs md:text-sm
        ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 active:translate-y-1 active:shadow-none"}
        ${activeStyle}
        ${className}
      `}
      style={{ textShadow: "0 1px 0 rgba(0,0,0,0.5)" }}
    >
      <div className="absolute top-1 left-1 right-1 h-1/3 bg-white/10 rounded-t-lg pointer-events-none" />
      <span className="relative z-10 truncate px-1">{children}</span>
    </button>
  );
};


// --- COMPONENTE PRINCIPAL ---

type Props = {
  chests: ChestItem[];
  games: MiniGameTemplate[];
};

export default function ChestShop({ chests, games }: Props) {
    console.log(chests)
  const [selectedChest, setSelectedChest] = useState<ChestItem | null>(null);

  const handleBuyClick = (chest: ChestItem) => {
    if (chest.canAfford || chest.hasAttempts) {
      window.location.href = "https://www.lottu.bet.br/gamification/store";
    }
  };

  return (
    <div className="w-full font-sans">
      
      {/* Título da Seção */}
      <div className="relative text-center mb-8">
        <div className="inline-block relative">
           <h2 className="text-3xl font-black text-white uppercase italic drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]"
               style={{ WebkitTextStroke: "1.5px black" }}>
             Ofertas Especiais
           </h2>
           <div className="absolute -right-8 -top-4 rotate-12 text-4xl animate-bounce">💎</div>
        </div>
      </div>

      {/* Grid: 2 cols Mobile, 3 Tablet, 4 Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {chests.map((chest, index) => {
          // Lógica de Estado
          const game = findGameByTemplateId(games, chest.templateId);
          const spins = getGameSpins(game);
          
          const isReady = chest.hasAttempts && spins > 0;
          const canAfford = chest.canAfford;
          const isLocked = !isReady && !canAfford;

          return (
            <div
              key={chest.id}
              className="group h-full animate-fadeInUp"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedChest(chest)} // Abre o Modal
            >
              {/* O Card */}
              <div className={`
                relative flex flex-col items-center p-2 md:p-4 rounded-xl md:rounded-[24px] border-[3px] md:border-[4px] shadow-lg overflow-hidden bg-[#242424] h-full cursor-pointer
                transition-transform duration-200 active:scale-95
                ${isReady 
                  ? "border-[#00d000] shadow-[#00d000]/10" 
                  : canAfford 
                    ? "border-[#338aff] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#338aff]/20" 
                    : "border-[#4a4a4a]" 
                }
              `}>
                
                {/* Background Radiante */}
                <div className="absolute inset-0 bg-[#352554]">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:8px_8px]" />
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#242424]/50 to-[#242424]" />
                </div>

                {/* Ribbon (Só se existir no JSON) */}
                {chest.ribbon && (
                  <div className="absolute -top-[2px] -right-[2px] z-20">
                    <div className="bg-[#ff3b30] text-white text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-bl-xl border-l-2 border-b-2 border-[#b91c1c] shadow-md">
                      {chest.ribbon}
                    </div>
                  </div>
                )}

                {/* Nome do Item */}
                <div className="relative z-10 w-full text-center mt-1 mb-2 h-10 md:h-12 flex flex-col justify-center">
                  <h3 className="text-white font-black uppercase text-xs md:text-base leading-tight drop-shadow-md line-clamp-2"
                      style={{ WebkitTextStroke: "0.5px black" }}>
                    {chest.name}
                  </h3>
                </div>

                {/* Área da Imagem */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-2 z-10">
                   {/* Se bloqueado: Grayscale + Opacidade, mas visível */}
                   <div className={`
                     relative w-full h-full transition-all duration-300 
                     ${isLocked ? 'grayscale opacity-80' : 'group-hover:scale-110 group-hover:rotate-3'}
                   `}>
                     {chest.image ? (
                       <Image
                         src={chest.image}
                         alt={chest.name}
                         fill
                         className="object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                         sizes="(max-width: 768px) 100px, 150px"
                       />
                     ) : (
                       <div className="text-5xl flex items-center justify-center h-full">📦</div>
                     )}
                   </div>
                </div>

                {/* Footer */}
                <div className="w-full mt-auto z-10 flex flex-col gap-2">
                  
                  {/* Preço ou Giros */}
                  <div className="flex justify-center">
                    {isReady ? (
                      <div className="bg-[#00d000]/20 border border-[#00d000] text-[#00d000] px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wide animate-pulse">
                        {spins} Giros
                      </div>
                    ) : (
                      // Preço: Vermelho se bloqueado, Branco se ok
                      <div className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-colors
                        ${canAfford ? "bg-black/40 border-white/10" : "bg-red-900/20 border-red-500/30"}
                      `}>
                         <CurrencyIcon type={chest.purchase_type} />
                         <span className={`
                           font-black text-sm md:text-lg shadow-black drop-shadow-sm
                           ${canAfford ? "text-white" : "text-[#ff4d4d]"}
                         `}>
                           {chest.price}
                         </span>
                      </div>
                    )}
                  </div>

                  {/* Botão de Ação */}
                  <JuicyButton 
                    variant={isReady ? "green" : "blue"}
                    onClick={(e: any) => {
                      e.stopPropagation(); // Impede abrir o modal ao clicar no botão
                      handleBuyClick(chest);
                    }}
                    disabled={isLocked}
                  >
                    {isReady ? "ABRIR" : canAfford ? "COMPRAR" : "BLOQUEADO"}
                  </JuicyButton>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO --- */}
      {selectedChest && (
        <ChestPreviewModal 
          chest={selectedChest}
          onClose={() => setSelectedChest(null)}
          onBuy={() => {
            handleBuyClick(selectedChest);
            setSelectedChest(null);
          }}
        />
      )}

      {/* Empty State */}
      {chests.length === 0 && (
         <div className="text-center py-12 opacity-60">
            <h3 className="text-xl font-black text-white uppercase">Loja Fechada</h3>
            <p className="text-gray-400">Volte mais tarde!</p>
         </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}