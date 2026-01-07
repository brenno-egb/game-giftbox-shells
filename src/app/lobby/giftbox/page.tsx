"use client";

import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { useChestHall } from "@/games/templates/giftbox/chest/useChestHall";
import { useSearchParams } from "next/navigation";
import UserProfileHeader from "@/components/games/giftbox/UserProfile";
import ChestCard from "@/components/games/giftbox/ChestCard";
import PurchaseButton from "@/components/games/giftbox/PurchaseButton";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";

export default function HallPage() {
  const searchParams = useSearchParams();
  const { isReady, storesReady, error: smarticoError } = useSmartico();
  
  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang");

  // Verifica parâmetros
  if (!uid || !lang) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-amber-900/20 border-2 border-amber-500 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">⚠️ Parâmetros Faltando</h2>
          <p className="text-amber-300 mb-4">
            Esta página precisa dos parâmetros <code className="bg-black/50 px-1 rounded">uid</code> e <code className="bg-black/50 px-1 rounded">lang</code> na URL.
          </p>
          <p className="text-gray-400 text-sm mb-4">Exemplo:</p>
          <code className="block bg-black/50 p-2 rounded text-xs text-amber-300 mb-4">
            /lobby/giftbox?uid=SEU_USER_ID&lang=pt
          </code>
          <div className="text-gray-400 text-sm">
            Parâmetros atuais:
            <ul className="mt-2 space-y-1">
              <li>uid: {uid ? `✅ ${uid}` : "❌ faltando"}</li>
              <li>lang: {lang ? `✅ ${lang}` : "❌ faltando"}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Erro no boot
  if (smarticoError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Erro ao Iniciar</h2>
          <p className="text-red-300">{smarticoError}</p>
        </div>
      </div>
    );
  }

  // Aguarda Smartico
  if (!isReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Carregando Smartico...</div>
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // ✅ NOVO: Aguarda stores carregarem dados iniciais
  if (!storesReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Carregando dados...</div>
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
          <div className="mt-4 text-sm text-white/60">Aguarde...</div>
        </div>
      </div>
    );
  }

  return <HallContent />;
}

function HallContent() {
  const hall = useChestHall();

  const handleChestClick = (chest: ChestItem) => {
    if (chest.hasAttempts && chest.templateId) {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid") || "test-user";
      const lang = params.get("lang") || "pt";
      window.location.href = `/games/giftbox?uid=${uid}&lang=${lang}`;
    } else if (chest.canAfford) {
      window.location.href = "https://www.lottu.bet.br/gamification/store";
    }
  };

  // Loading dos baús (diferente do loading de stores!)
  if (hall.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Carregando baús...</div>
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Erro ao carregar baús
  if (hall.error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Erro</h2>
          <p className="text-red-300">{hall.error}</p>
          <button
            onClick={() => hall.refresh()}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        <UserProfileHeader profile={hall.profile} />

        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Hall dos Baús
          </h1>
          <p className="text-gray-400">
            {hall.hasAvailable
              ? "Você tem baús disponíveis para abrir!"
              : "Compre baús para começar a jogar"}
          </p>
        </div>

        {hall.available.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <span>✨</span>
              <span>Disponíveis</span>
              <span className="bg-amber-500 text-black text-sm px-2 py-1 rounded-full">
                {hall.available.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hall.available.map((chest) => (
                <ChestCard
                  key={chest.id}
                  chest={chest}
                  onClick={handleChestClick}
                />
              ))}
            </div>
          </div>
        )}

        {hall.purchasable.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <span>🛒</span>
              <span>Você pode comprar</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hall.purchasable.map((chest) => (
                <ChestCard
                  key={chest.id}
                  chest={chest}
                  onClick={handleChestClick}
                />
              ))}
            </div>
          </div>
        )}

        {hall.locked.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-400 flex items-center gap-2">
              <span>🔒</span>
              <span>Bloqueados</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hall.locked.map((chest) => (
                <ChestCard key={chest.id} chest={chest} />
              ))}
            </div>
          </div>
        )}

        {hall.chests.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">Nenhum baú disponível</h2>
            <p className="text-gray-400">
              Visite a loja para comprar seus primeiros baús!
            </p>
          </div>
        )}

        <PurchaseButton hasAvailable={hall.hasAvailable} />
      </div>
    </div>
  );
}