"use client";

import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import { getChestStatusMessage } from "@/games/templates/giftbox/chest/chest.rules";
import { PURCHASE_TYPE_LABELS } from "@/games/templates/giftbox/chest/chest.types";

type Props = {
  chest: ChestItem;
  onClick?: (chest: ChestItem) => void;
};

export default function ChestCard({ chest, onClick }: Props) {
  const statusMessage = getChestStatusMessage(chest);
  const isAvailable = chest.hasAttempts;
  const canAfford = chest.canAfford;

  const handleClick = () => {
    if (onClick) onClick(chest);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative rounded-2xl overflow-hidden
        transition-all duration-300
        ${
          isAvailable
            ? "bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50"
            : canAfford
            ? "bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border-2 border-emerald-500 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
            : "bg-gradient-to-br from-slate-700/20 to-slate-900/20 border-2 border-slate-600 opacity-60"
        }
      `}
    >
      {/* Ribbon */}
      {chest.ribbon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg">
            {chest.ribbon}
          </span>
        </div>
      )}

      {/* Badge de disponível */}
      {isAvailable && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg animate-pulse">
            Disponível!
          </span>
        </div>
      )}

      {/* Imagem */}
      <div className="relative aspect-square p-6 flex items-center justify-center">
        {chest.image ? (
          <img
            src={chest.image}
            alt={chest.name}
            className={`
              w-full h-full object-contain
              transition-transform duration-300
              ${isAvailable ? "group-hover:scale-110" : ""}
            `}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-4xl font-bold">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-white truncate">
          {chest.name}
        </h3>

        {chest.description && (
          <p className="text-sm text-gray-300 truncate">
            {chest.description}
          </p>
        )}

        {/* Status */}
        <div className="flex items-center justify-between pt-2">
          <span
            className={`
              text-sm font-bold
              ${isAvailable ? "text-amber-400" : canAfford ? "text-emerald-400" : "text-gray-400"}
            `}
          >
            {statusMessage}
          </span>

          {!isAvailable && (
            <span className="text-xs text-gray-400">
              {chest.price} {PURCHASE_TYPE_LABELS[chest.purchase_type]}
            </span>
          )}
        </div>
      </div>

      {/* Hover effect */}
      {(isAvailable || canAfford) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  );
}