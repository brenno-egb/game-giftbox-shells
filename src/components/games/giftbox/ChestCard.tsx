"use client";

import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import { PURCHASE_TYPE_LABELS } from "@/games/templates/giftbox/chest/chest.types";

type Props = {
  chest: ChestItem;
  onClick?: (chest: ChestItem) => void;
};

export default function ChestCard({ chest, onClick }: Props) {
  const isAvailable = chest.hasAttempts;
  const canAfford = chest.canAfford;

  // Estilos Baseados em Estado (Cores Supercell)
  const theme = isAvailable 
    ? { border: "border-[#00d000]", bg: "from-[#00d000]/20 to-[#005900]/20", glow: "shadow-[#00d000]/20" }
    : canAfford 
    ? { border: "border-[#338aff]", bg: "from-[#338aff]/20 to-[#003380]/20", glow: "shadow-[#338aff]/20" }
    : { border: "border-[#465363]", bg: "from-[#2b333d]/50 to-[#1a1f26]/50", glow: "" };

  return (
    <div
      onClick={() => onClick && onClick(chest)}
      className={`
        group relative rounded-[18px] border-[3px] overflow-hidden cursor-pointer select-none
        transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
        bg-[#1a1f26] ${theme.border} ${theme.glow}
      `}
    >
      {/* Background Decorativo */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50`} />
      
      {/* Ribbon */}
      {chest.ribbon && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-[#ff3b30] text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg border-l border-b border-[#b91c1c]">
            {chest.ribbon}
          </div>
        </div>
      )}

      <div className="relative p-3 flex items-center gap-4">
        {/* Avatar/Icone */}
        <div className="relative w-16 h-16 shrink-0 bg-black/30 rounded-xl border border-white/10 flex items-center justify-center">
           {chest.image ? (
             <img src={chest.image} alt={chest.name} className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
           ) : (
             <span className="text-2xl">📦</span>
           )}
           {isAvailable && (
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d000] border-2 border-white rounded-full animate-pulse" />
           )}
        </div>

        {/* Info Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-black text-sm uppercase leading-tight truncate">
            {chest.name}
          </h3>
          <p className="text-gray-400 text-xs font-bold truncate opacity-80">
            {chest.description || "Item Místico"}
          </p>
          
          <div className="mt-1 flex items-center gap-2">
            {!isAvailable && canAfford && (
               <span className="text-[#ffc800] font-black text-sm drop-shadow-sm">
                 {chest.price} {PURCHASE_TYPE_LABELS[chest.purchase_type]?.[0] || "$"}
               </span>
            )}
            {isAvailable && (
               <span className="text-[#00d000] font-black text-xs uppercase">Pronto para abrir</span>
            )}
            {!canAfford && !isAvailable && (
               <span className="text-gray-500 font-bold text-xs uppercase">Bloqueado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}