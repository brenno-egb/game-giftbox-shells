"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { giftboxSkins } from "@/games/templates/giftbox/skins";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import { getGameUrl, getGameSpins } from "@/games/templates/giftbox/chest/chest.helpers";

// --- Ícones Customizados (Estilo Chunky) ---
const Icons = {
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-md">
      <path d="M16 19l-7-7 7-7" className="stroke-white stroke-[4]" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-md">
      <path d="M8 5l7 7-7 7" className="stroke-white stroke-[4]" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 animate-pulse">
      <path d="M21 2l-2 5M21 2l-5 2M21 2l-9 9a4 4 0 00-1.8 1.1L2 20.3a1 1 0 00.3 1.4l1.3 1 1 1.3a1 1 0 001.4.3l8.2-8.2A4 4 0 0015.3 14" className="stroke-yellow-300 stroke-[3]" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="8" r="2" className="fill-yellow-300" />
    </svg>
  )
};

type Props = {
  games: MiniGameTemplate[];
  uid: string;
  lang: string;
};

type AvailableChest = {
  skinId: string;
  skinData: any;
  game: MiniGameTemplate;
  spins: number;
};

export default function ChestCarousel({ games, uid, lang }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lógica de dados
  const availableChests = useMemo((): AvailableChest[] => {
    const available: AvailableChest[] = [];
    for (const [skinId, skinData] of Object.entries(giftboxSkins)) {
      const game = games.find((g) => Number(g.id) === Number(skinData.templateId));
      if (!game) continue;
      const spins = getGameSpins(game);
      if (spins > 0) {
        available.push({ skinId, skinData, game, spins });
      }
    }
    return available;
  }, [games]);

  // --- Estado Vazio ---
  if (availableChests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-32 h-32 bg-[#1e2337] rounded-[2rem] border-4 border-[#2d3548] flex items-center justify-center mb-6 opacity-60">
           <span className="text-5xl grayscale">📦</span>
        </div>
        <h3 className="text-2xl font-black text-gray-500 uppercase italic">Inventário Vazio</h3>
        <p className="text-gray-600 font-bold">Adquira baús na loja!</p>
      </div>
    );
  }

  // --- Lógica de Navegação Circular ---
  const current = availableChests[currentIndex];
  
  const prevIndex = currentIndex === 0 ? availableChests.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === availableChests.length - 1 ? 0 : currentIndex + 1;
  
  const prevChest = availableChests[prevIndex];
  const nextChest = availableChests[nextIndex];

  // Cores dinâmicas ou fallback
  const theme = current.skinData.theme || { accent: '#f59e0b', accentGlow: '#fbbf24', accentBorder: '#b45309' };
  
  // Imagens
  const currentImage = current.game.thumbnail;
  const prevImage = prevChest.game.thumbnail;
  const nextImage = nextChest.game.thumbnail;

  const handlePrev = () => setCurrentIndex(prevIndex);
  const handleNext = () => setCurrentIndex(nextIndex);
  const handleOpen = () => window.location.href = getGameUrl(current.skinId, uid, lang);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 font-sans select-none">
      
      {/* HEADER: Badge Central */}
      <div className="flex justify-center mb-12">
        <div className="relative z-10">
          {/* Sombra do Badge */}
          <div className="absolute inset-0 bg-black/60 rounded-full translate-y-2 blur-[2px]" />
          
          <div className="relative bg-gradient-to-b from-[#2e1a47] to-[#1a0f2e] px-8 py-3 rounded-full border-4 border-[#5b21b6] flex items-center gap-3 shadow-2xl">
            <div className="bg-[#5b21b6] rounded-lg p-1">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase italic tracking-widest leading-none">
                Seus Baús
              </h2>
              <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider text-center">
                Escolha para abrir
              </p>
            </div>
            <div className="bg-[#a78bfa] text-[#2e1a47] font-black text-sm px-3 py-1 rounded-md ml-2 border-b-2 border-[#7c3aed]">
              {availableChests.length}
            </div>
          </div>
        </div>
      </div>

      {/* --- CARROSSEL STAGE --- */}
      <div className="relative h-[450px] flex items-center justify-center perspective-[1000px]">
        
        {/* === BAÚ ANTERIOR (Preview Esquerda) === */}
        {availableChests.length > 1 && (
          <div 
            className="absolute left-[5%] md:left-[10%] z-0 opacity-40 blur-[1px] scale-75 transition-all duration-500 cursor-pointer hover:opacity-60"
            onClick={handlePrev}
          >
             <div className="w-48 h-64 bg-[#0f111a] rounded-[2rem] border-[4px] border-gray-700 flex flex-col items-center justify-center p-4 shadow-xl grayscale">
                <div className="relative w-32 h-32 mb-4">
                  <Image src={prevImage} alt="Prev" fill className="object-contain" />
                </div>
                <div className="h-4 w-20 bg-gray-700 rounded-full" />
             </div>
          </div>
        )}

        {/* === BAÚ PRÓXIMO (Preview Direita) === */}
        {availableChests.length > 1 && (
          <div 
            className="absolute right-[5%] md:right-[10%] z-0 opacity-40 blur-[1px] scale-75 transition-all duration-500 cursor-pointer hover:opacity-60"
            onClick={handleNext}
          >
             <div className="w-48 h-64 bg-[#0f111a] rounded-[2rem] border-[4px] border-gray-700 flex flex-col items-center justify-center p-4 shadow-xl grayscale">
                <div className="relative w-32 h-32 mb-4">
                  <Image src={nextImage} alt="Next" fill className="object-contain" />
                </div>
                <div className="h-4 w-20 bg-gray-700 rounded-full" />
             </div>
          </div>
        )}

        {/* === SETAS DE NAVEGAÇÃO (Arcade Buttons) === */}
        {availableChests.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 md:left-4 z-20 w-14 h-14 bg-[#3b82f6] hover:bg-[#60a5fa] rounded-xl border-b-[6px] border-[#1d4ed8] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center shadow-lg group"
            >
              <div className="group-active:scale-90 transition-transform"><Icons.ArrowLeft /></div>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 md:right-4 z-20 w-14 h-14 bg-[#3b82f6] hover:bg-[#60a5fa] rounded-xl border-b-[6px] border-[#1d4ed8] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center shadow-lg group"
            >
              <div className="group-active:scale-90 transition-transform"><Icons.ArrowRight /></div>
            </button>
          </>
        )}

        {/* === HERO CARD (Baú Central) === */}
        <div className="relative z-10 w-[300px] md:w-[340px] transition-all duration-500">
            
            {/* Efeito de Luz "God Rays" atrás do baú */}
            <div className="absolute inset-0 -z-10 animate-[spin_10s_linear_infinite] opacity-30 pointer-events-none scale-150">
               <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,var(--glow-color)_20deg,transparent_40deg)]" style={{ '--glow-color': theme.accent } as any} />
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-radial from-white/10 to-transparent blur-2xl transform scale-125" />

            {/* O CARD PRINCIPAL */}
            <div 
              className="relative bg-[#1e2337] rounded-[2.5rem] border-[4px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
              style={{ borderColor: theme.accentBorder || '#475569' }}
            >
              
              {/* Container da Imagem (Fundo Escuro) */}
              <div className="relative bg-[#11131f] rounded-[2rem] h-64 w-full flex items-center justify-center overflow-hidden border-2 border-white/5 mb-[-20px] pb-6 z-0">
                {/* Imagem do Baú Flutuando */}
                <div 
                  className="relative w-56 h-56 z-10"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  <Image 
                    src={currentImage} 
                    alt={current.game.name}
                    fill
                    className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>

                {/* Badge de Spins (Estilo Notificação Vermelha) */}
                <div className="absolute top-4 right-4 z-20 animate-[bounce_2s_infinite]">
                   <div className="bg-[#ef4444] text-white text-lg font-black px-3 py-1.5 rounded-xl border-2 border-white shadow-lg rotate-6">
                      {current.spins}x
                   </div>
                </div>
              </div>

              {/* Área de Conteúdo Inferior */}
              <div className="relative z-10 bg-[#1e2337] rounded-b-[2rem] pt-8 pb-6 px-4 text-center">
                 {/* Divisor curvo para esconder o fundo da imagem */}
                 <div className="absolute -top-8 left-0 right-0 h-8 bg-[#1e2337] rounded-t-[50%] scale-x-110" />

                 <h3 className="text-2xl font-black text-white uppercase italic tracking-wide leading-none drop-shadow-md mb-2">
                   {current.game.name}
                 </h3>
                 
                 {current.game.description && (
                   <p className="text-slate-400 text-xs font-bold leading-tight line-clamp-2 px-4 mb-6 h-8">
                     {current.game.description}
                   </p>
                 )}

                 {/* Botão GIGANTE de Ação */}
                 <button 
                   onClick={handleOpen}
                   className="w-full relative group transform transition-transform active:scale-95"
                 >
                    <div className="absolute inset-0 bg-[#065f46] rounded-2xl translate-y-[6px]" />
                    <div className="relative bg-gradient-to-b from-[#10b981] to-[#059669] p-4 rounded-2xl border-t border-white/30 flex items-center justify-center gap-2 shadow-lg group-hover:brightness-110 transition-all">
                       <Icons.Key />
                       <span className="text-white font-black text-xl uppercase tracking-widest drop-shadow-md">
                         Abrir
                       </span>
                    </div>
                 </button>
              </div>
            </div>
        </div>
      </div>

      {/* Indicadores de Posição (Bolinhas) */}
      <div className="flex justify-center gap-3 mt-8">
        {availableChests.map((_, idx) => (
          <div 
            key={idx}
            className={`
              h-3 rounded-full transition-all duration-300 border-2 border-black/20
              ${idx === currentIndex ? 'w-10 bg-[#fbbf24]' : 'w-3 bg-slate-700'}
            `}
          />
        ))}
      </div>

      {/* Styles Globais para Animação */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}