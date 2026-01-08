"use client";

import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { useChestHall } from "@/games/templates/giftbox/chest/useChestHall";
import { useSearchParams } from "next/navigation";
import { Rubik } from "next/font/google";

// Componentes do Jogo
import UserProfileHeader from "@/components/games/giftbox/UserProfile";
import ChestCarousel from "@/components/games/giftbox/ChestCarousel";
import ChestShop from "@/components/games/giftbox/ChestShop";
import LoadingScreen from "@/components/games/giftbox/LoadingScreen";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// --- Error Component (Pode manter aqui ou extrair também se quiser) ---
const ErrorScreen = ({ title, message, onRetry }: any) => (
  <div className="min-h-screen bg-[#1a0f0f] flex items-center justify-center p-4 font-sans">
    <div className="max-w-md w-full bg-[#2a1a1a] border-[4px] border-[#5c2b2b] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,#000_100%)] opacity-50" />

      <div className="relative z-10">
        <div className="text-6xl mb-4 grayscale opacity-50">⚠️</div>
        <h2 className="text-2xl font-black text-[#ff3b30] uppercase mb-2">
          {title}
        </h2>
        <p className="text-[#ccacaa] font-bold mb-6">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-[#ff3b30] hover:bg-[#d32f2f] text-white font-black py-3 px-8 rounded-xl border-b-4 border-[#b71c1c] active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  </div>
);

export default function HallPage() {
  const searchParams = useSearchParams();
  const { isReady, error: smarticoError } = useSmartico();

  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang");

  // Validação de Parâmetros
  if (!uid || !lang) {
    return (
      <ErrorScreen
        title="Parâmetros Inválidos"
        message="As credenciais de jogador (UID/LANG) não foram detectadas."
      />
    );
  }

  // Erro Smartico
  if (smarticoError) {
    return <ErrorScreen title="Erro de Conexão" message={smarticoError} />;
  }

  // Loading Inicial (Usando o novo componente)
  if (!isReady) {
    return <LoadingScreen message="Conectando..." />;
  }

  return <HallContent uid={uid} lang={lang} />;
}

function HallContent({ uid, lang }: { uid: string; lang: string }) {
  const hall = useChestHall();

  // Loading de Recursos (Usando o novo componente)
  if (hall.isLoading) return <LoadingScreen message="Carregando Recursos..." />;

  if (hall.error)
    return (
      <ErrorScreen
        title="Falha no Sistema"
        message={hall.error}
        onRetry={() => hall.refresh()}
      />
    );

  return (
    <div
      className={[
        "flex justify-center min-h-screen bg-[#15191F] selection:bg-[#ffc800] selection:text-black overflow-x-hidden",
        rubik.className,
      ].join(" ")}
    >
      {/* Background Pattern Global (Tileable) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Conteúdo Principal */}
      <div className="relative p-4 pb-32">
        {/* Header do Jogador */}
        <section className="relative z-20 mb-2">
          <UserProfileHeader profile={hall.profile} level={hall.level} />
        </section>

        {/* Título da Seção */}
        <div className="text-center relative z-10 mt-4">
          <h1
            className="text-4xl font-black uppercase tracking-tighter
                      bg-linear-to-b from-[#F5C92F] to-[#D07D07]
                      bg-clip-text text-transparent
                      drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]"
          >
            Baús Disponíveis
          </h1>
        </div>

        {/* --- INVENTÁRIO (Carrossel 3D) --- */}
        <section className="relative z-10">
          <ChestCarousel games={hall.games} uid={uid} lang={lang} />
        </section>

        {/* Divisor Decorativo */}
        <div className="flex items-center justify-center gap-4 opacity-50">
          <div className="h-1 w-full bg-[#0c1833] rounded-full" />
          <div className="shrink-0 w-3 h-3 bg-[#3a6bc2] rotate-45" />
          <div className="h-1 w-full bg-[#0c1833] rounded-full" />
        </div>

        {/* --- LOJA (Grid de Ofertas) --- */}
        <section className="relative z-10 mt-12">
          <ChestShop chests={hall.chests} games={hall.games} />
        </section>
      </div>

      {/* Footer Decorativo Fixo */}
      <div className="absolute top-0 left-0 right-0 h-30 bg-linear-to-b from-[#000000] to-transparent pointer-events-none z-0" />
    </div>
  );
}
