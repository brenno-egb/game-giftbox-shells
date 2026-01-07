"use client";

import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { useChestHall } from "@/games/templates/giftbox/chest/useChestHall";
import { useSearchParams } from "next/navigation";
import UserProfileHeader from "@/components/games/giftbox/UserProfile";
import ChestCarousel from "@/components/games/giftbox/ChestCarousel";
import ChestShop from "@/components/games/giftbox/ChestShop";

export default function HallPage() {
  const searchParams = useSearchParams();
  const { isReady, error: smarticoError } = useSmartico();
  
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

  return <HallContent uid={uid} lang={lang} />;
}

function HallContent({ uid, lang }: { uid: string; lang: string }) {
  const hall = useChestHall();

  // Loading
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

  // Erro
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
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-16 pb-32">
        {/* Header com perfil */}
        <UserProfileHeader profile={hall.profile} />

        {/* Título Principal */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            Hall dos Baús
          </h1>
          <p className="text-gray-400">
            {hall.hasAvailable
              ? "Abra seus baús disponíveis ou compre mais na loja!"
              : "Compre baús para começar a jogar"}
          </p>
        </div>

        {/* Carrossel - APENAS games, uid, lang */}
        <section>
          <ChestCarousel 
            games={hall.games}
            uid={uid} 
            lang={lang} 
          />
        </section>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950 px-6 text-gray-500 text-sm">
              ou explore a loja
            </span>
          </div>
        </div>

        {/* Loja Completa - usa chests + games */}
        <section>
          <ChestShop 
            chests={hall.chests}
            games={hall.games}
          />
        </section>
      </div>
    </div>
  );
}