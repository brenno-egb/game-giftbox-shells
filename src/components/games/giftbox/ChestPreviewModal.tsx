"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

// Imports do seu projeto
import GiftboxChestRive from "@/games/templates/giftbox/animation";
import { getSkinByChest } from "@/games/templates/giftbox/chest/chest.helpers";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";

// --- SUB-COMPONENTES VISUAIS ---

// Botão estilo Supercell (Verde/Azul)
const JuicyButton = ({ children, onClick, variant = "green", className }: any) => {
  const styles: any = {
    green: "bg-[#00d000] border-[#007c00] text-white shadow-[0_4px_0_#005900]",
    blue: "bg-[#338aff] border-[#004bbd] text-white shadow-[0_4px_0_#003380]",
    gray: "bg-[#555f6d] border-[#363d45] text-[#aeb5bc] shadow-[0_4px_0_#252a30]",
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-xl border-b-4 font-black uppercase tracking-wide 
        active:border-b-0 active:translate-y-1 transition-all select-none
        ${styles[variant]} 
        ${className}
      `}
    >
      <span className="drop-shadow-sm">{children}</span>
    </button>
  );
};

// Ícone de Moeda Dinâmico
const CurrencyIcon = ({ type }: { type?: string }) => {
  if (type === 'gems' || type === 'diamonds') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-sm filter">
        <path d="M7.5 18L3 9l9-7 9 7-4.5 9h-9z" className="fill-emerald-400 stroke-emerald-600 stroke-2" />
        <path d="M3 9h18" className="stroke-emerald-600/50 stroke-1" />
        <path d="M12 2l-3 7 3 9 3-9-3-7z" className="fill-white/30" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-sm filter">
      <circle cx="12" cy="12" r="9" className="fill-amber-400 stroke-amber-600 stroke-2" />
      <circle cx="12" cy="12" r="6" className="stroke-amber-600/50 stroke-1" />
      <path d="M12 6v12M6 12h12" className="stroke-amber-600/30" />
    </svg>
  );
};

// --- COMPONENTE PRINCIPAL ---

type Props = {
  chest: ChestItem;
  onClose: () => void;
  onBuy: () => void;
};

export default function ChestPreviewModal({ chest, onClose, onBuy }: Props) {
  // 1. Busca a skin usando o helper robusto (StoreId > TemplateId > Name)
  const skin = getSkinByChest(chest);
  
  // 2. Define o tema (fallback para azul se não achar skin)
  const theme = skin?.theme || { accent: "#338aff" };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      
      {/* Backdrop (Fundo Escuro com Blur) */}
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
        className="relative w-full max-w-sm md:max-w-md bg-[#162955] rounded-[32px] border-[6px] border-[#3a6bc2] shadow-2xl overflow-hidden flex flex-col"
      >
        
        {/* Botão Fechar (Canto Superior) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors border-2 border-white/10"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* --- ÁREA DE SHOWCASE (Topo) --- */}
        <div className="relative h-72 w-full flex items-center justify-center bg-gradient-to-b from-[#3a6bc2]/40 to-[#162955] overflow-hidden">
          
          {/* Brilho de Fundo (Glow) baseado na skin */}
          <div 
            className="absolute inset-0 opacity-50 blur-3xl scale-150"
            style={{ background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)` }} 
          />
          
          {/* Raios de Luz Giratórios */}
          <div className="absolute inset-0 opacity-20 animate-[spin_12s_linear_infinite]">
             <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,white_20deg,transparent_40deg)]" />
          </div>

          {/* O ITEM (Rive ou Imagem) */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
             {skin?.rivePath ? (
               /* CENÁRIO A: Rive encontrado */
               <div className="w-full h-full transform scale-125">
                 <GiftboxChestRive 
                   path={skin.rivePath}
                   isOpen={true}      // Força estado aberto
                   triggerFinal={true} // Pula para o loop final
                   className="w-full h-full"
                 />
               </div>
             ) : (
               /* CENÁRIO B: Fallback para Imagem Flutuante */
               <motion.div 
                 animate={{ y: [-10, 10, -10], rotate: [0, 2, -2, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="relative w-48 h-48"
               >
                 {chest.image ? (
                   <Image 
                     src={chest.image} 
                     alt={chest.name} 
                     fill 
                     className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                   />
                 ) : (
                   <div className="text-8xl flex items-center justify-center h-full">📦</div>
                 )}
               </motion.div>
             )}
          </div>
        </div>

        {/* --- ÁREA DE INFO (Base) --- */}
        <div className="p-6 pt-0 text-center space-y-4 relative z-20 bg-[#162955]">
           
           {/* Título e Descrição */}
           <div>
             <h2 className="text-2xl font-black text-white uppercase italic tracking-wider drop-shadow-md leading-tight"
                 style={{ WebkitTextStroke: "1px black" }}>
               {chest.name}
             </h2>
             {chest.description && (
               <p className="text-[#8fa3c7] font-bold text-sm mt-2 px-4 leading-snug">
                 {chest.description}
               </p>
             )}
           </div>

           {/* Box de Compra */}
           <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mt-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <CurrencyIcon type={chest.purchase_type} />
                 <span className={`text-3xl font-black drop-shadow-md ${chest.canAfford ? "text-white" : "text-[#ff4d4d]"}`}>
                    {chest.price}
                 </span>
                 <span className="text-xs font-bold uppercase bg-white/10 px-2 py-1 rounded text-white/70">
                    {chest.purchase_type || "Créditos"}
                 </span>
              </div>

              <JuicyButton 
                variant="green" 
                onClick={onBuy} 
                className="w-full py-4 text-lg"
              >
                {chest.canAfford ? "COMPRAR AGORA" : "SALDO INSUFICIENTE"}
              </JuicyButton>
           </div>
        </div>
      </motion.div>
    </div>
  );
}