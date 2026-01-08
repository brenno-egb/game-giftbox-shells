"use client";

import dynamic from "next/dynamic";
import type { GameKey } from "@/games/registry";
import LoadingScreen from "@/components/games/giftbox/LoadingScreen";

const GiftboxGame = dynamic(
  () => import("@/games/templates/giftbox/GiftboxGame"),
  {
    ssr: false,
    loading: () => (
      <LoadingScreen 
        message="Carregando Jogo" 
        backgroundImage="/games/giftbox/background.avif"
      />
    ),
  }
);

type Props = {
  gameKey: GameKey;
  smartico: any;
  templateId: number | string;
  skin: any;
};

export default function GameRenderer({ gameKey, ...props }: Props) {
  switch (gameKey) {
    case "giftbox":
      return <GiftboxGame {...props} />;
    default:
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
          <div className="max-w-lg w-full bg-yellow-950/30 border-2 border-yellow-500 rounded-xl p-8 text-center shadow-2xl">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-yellow-500 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-yellow-500 uppercase mb-2">
              Template Não Suportado
            </h2>
            <p className="text-yellow-200/80 mb-6">
              O template <code className="px-2 py-1 bg-black/50 rounded">{gameKey}</code> não está disponível.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      );
  }
}