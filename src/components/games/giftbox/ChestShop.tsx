"use client";

import Image from "next/image";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import { findGameByTemplateId, getGameSpins } from "@/games/templates/giftbox/chest/chest.helpers";

type Props = {
  chests: ChestItem[];
  games: MiniGameTemplate[];
};

export default function ChestShop({ chests, games }: Props) {
  const handleBuyClick = (chest: ChestItem) => {
    if (chest.canAfford || chest.hasAttempts) {
      window.location.href = "https://www.lottu.bet.br/gamification/store";
    }
  };

  const getChestStatusBadge = (chest: ChestItem) => {
    // Busca game para obter spins corretos
    const game = findGameByTemplateId(games, chest.templateId);
    const spins = getGameSpins(game);
    
    if (chest.hasAttempts && spins > 0) {
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-900 shadow-lg z-10">
          {spins}× Disponível
        </div>
      );
    }
    
    if (!chest.canAfford) {
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-900 shadow-lg z-10 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Bloqueado
        </div>
      );
    }
    
    return null;
  };

  const getChestStyle = (chest: ChestItem) => {
    if (chest.hasAttempts) {
      return {
        opacity: "opacity-100",
        scale: "hover:scale-105",
        border: "border-emerald-500/50",
        glow: "shadow-emerald-500/20",
        filter: "",
      };
    }
    
    if (!chest.canAfford) {
      return {
        opacity: "opacity-50",
        scale: "hover:scale-102",
        border: "border-gray-700/50",
        glow: "shadow-gray-900/50",
        filter: "grayscale",
      };
    }
    
    return {
      opacity: "opacity-90",
      scale: "hover:scale-105",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
      filter: "",
    };
  };

  const getPriceColor = (chest: ChestItem) => {
    if (chest.canAfford) {
      return "text-emerald-400";
    }
    return "text-gray-500";
  };

  return (
    <div>
      {/* Header da Loja */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 px-6 py-3 rounded-full border border-purple-500/30">
          <span className="text-2xl">🛒</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
            Loja de Baús
          </h2>
        </div>
        <p className="text-gray-400 mt-3">
          Compre baús para aumentar suas chances de ganhar prêmios incríveis
        </p>
      </div>

      {/* Grid de Baús */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {chests.map((chest) => {
          const style = getChestStyle(chest);
          
          return (
            <div
              key={chest.id}
              className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 ${style.border} rounded-2xl p-6 transition-all ${style.scale} ${style.opacity} ${style.glow} shadow-xl`}
            >
              {/* Badge de Status */}
              {getChestStatusBadge(chest)}

              {/* Ribbon (se tiver) */}
              {chest.ribbon && (
                <div className="absolute top-4 left-4 bg-purple-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  {chest.ribbon}
                </div>
              )}

              {/* Imagem do Baú */}
              <div className={`relative mb-4 ${style.filter}`}>
                <div className="w-full aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
                  {chest.image ? (
                    <Image
                      src={chest.image}
                      alt={chest.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                </div>
                
                {/* Ícone de Bloqueado */}
                {!chest.canAfford && !chest.hasAttempts && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Nome do Baú */}
              <h3 className="text-lg font-bold text-white mb-2 truncate">
                {chest.name}
              </h3>

              {/* Descrição */}
              {chest.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {chest.description}
                </p>
              )}

              {/* Preço */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getPriceColor(chest)}`}>
                    {chest.price}
                  </span>
                  <span className="text-gray-500 text-sm uppercase">
                    {chest.purchase_type}
                  </span>
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={() => handleBuyClick(chest)}
                disabled={!chest.canAfford && !chest.hasAttempts}
                className={`w-full font-bold py-3 rounded-xl transition-all ${
                  chest.hasAttempts
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
                    : chest.canAfford
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
              >
                {chest.hasAttempts
                  ? "🎁 Ver na Loja"
                  : chest.canAfford
                  ? "🛒 Comprar"
                  : "🔒 Bloqueado"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mensagem se vazio */}
      {chests.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">🏪</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            Loja vazia
          </h3>
          <p className="text-gray-500">
            Nenhum baú disponível no momento
          </p>
        </div>
      )}
    </div>
  );
}