"use client";

import { useState, useMemo } from "react";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import { 
  findGameByTemplateId, 
  getGameSpins, 
  getSkinByChest, 
  getChestShopImage,
  sortChestsByOrder
} from "@/games/templates/giftbox/chest/chest.helpers";

import { ChestCardCompact, ChestCardWide } from "./ChestCards";
import ChestPreviewModal from "./ChestPreviewModal";

type Props = {
  chests: ChestItem[];
  games: MiniGameTemplate[];
};

export default function ChestShop({ chests, games }: Props) {
  const [selectedChest, setSelectedChest] = useState<ChestItem | null>(null);

  const sortedChests = useMemo(() => sortChestsByOrder(chests), [chests]);

  const handleBuyClick = (chest: ChestItem) => {
    // Redirecionamento ou lógica de compra
    window.location.href = "https://www.lottu.bet.br/gamification/store";
  };

  return (
    <div className="w-full">
      
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

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {sortedChests.map((chest, index) => {
          // Lógica de Layout
          const isWide = index >= sortedChests.length - 2;
          const CardComponent = isWide ? ChestCardWide : ChestCardCompact;
          
          // --- LÓGICA DE DADOS (Extraída dos Cards) ---
          const game = findGameByTemplateId(games, chest.templateId);
          const spins = getGameSpins(game);
          const skin = getSkinByChest(chest);
          const imageUrl = getChestShopImage(chest);

          const isReady = chest.hasAttempts && spins > 0;
          const canAfford = chest.canAfford;
          
          // Define o status unificado para passar ao UI
          let status: 'ready' | 'buyable' | 'locked' = 'locked';
          if (isReady) status = 'ready';
          else if (canAfford) status = 'buyable';

          return (
            <CardComponent
              key={chest.id}
              index={index}
              // Dados Visuais
              name={chest.name}
              ribbon={chest.ribbon}
              imageInner={chest.image}
              imageBackground={imageUrl}
              backgroundColor={skin?.backgroundColor || '#352554'}
              priceLabel={chest.price}
              currencyType={chest.purchase_type}
              spinsAvailable={spins}
              status={status}
              // Ações
              onClick={() => setSelectedChest(chest)}
              onActionClick={(e: any) => {
                e.stopPropagation();
                if (isReady) {
                   setSelectedChest(chest); // Abrir modal se estiver pronto
                } else {
                   handleBuyClick(chest); // Comprar se não tiver giros
                }
              }}
            />
          );
        })}
      </div>

      {/* Modal */}
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
      {sortedChests.length === 0 && (
         <div className="text-center py-12 opacity-60">
            <h3 className="text-xl font-black text-white uppercase">Loja Fechada</h3>
            <p className="text-gray-400">Volte mais tarde!</p>
         </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}