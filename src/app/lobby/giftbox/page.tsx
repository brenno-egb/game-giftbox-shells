"use client";

import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { useChestHall } from "@/@games/templates/giftbox/chest/useChestHall";
import { useSearchParams } from "next/navigation";
import { Rubik } from "next/font/google";

import UserProfileHeader from "@/components/games/giftbox/UserProfile";
import ChestCarousel from "@/components/games/giftbox/ChestCarousel";
import ChestShop from "@/components/games/giftbox/ChestShop";
import LoadingScreen from "@/components/games/giftbox/LoadingScreen";
import { validateGameParamsFromURL } from "@/@games/core/utils/validation";
import { ErrorState } from "@/components/games/giftbox/shared/StateComponents";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export default function HallPage() {
  const searchParams = useSearchParams();
  const { isReady, error: smarticoError } = useSmartico();

  const validation = validateGameParamsFromURL(searchParams);

  if (!validation.valid) {
    return (
      <ErrorState title="Parâmetros Inválidos" message={validation.error} />
    );
  }

  const { uid, lang } = validation.params;

  if (smarticoError) {
    return <ErrorState title="Erro de Conexão" message={smarticoError} />;
  }

  if (!isReady) {
    return <LoadingScreen message="Conectando..." />;
  }

  return <HallContent uid={uid} lang={lang} />;
}

/**
 * Conteúdo do Hall
 * ⭐ Simplificado: useChestHall escuta props_change automaticamente
 */
function HallContent({ uid, lang }: { uid: string; lang: string }) {
  const hall = useChestHall();

  if (hall.isLoading) return <LoadingScreen message="Carregando Recursos..." />;

  if (hall.error)
    return (
      <ErrorState
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
      <div className="relative p-4 pb-6">
        {/* Header - Atualiza automaticamente via props_change */}
        <section className="relative z-20 mb-2">
          <UserProfileHeader profile={hall.profile} level={hall.level} />
        </section>

        <div className="text-center relative z-10 mt-4">
          <h1
            className="text-4xl font-black uppercase tracking-tighter
                      bg-linear-to-b from-[#F5C92F] to-[#D07D07]
                      bg-clip-text text-transparent
                      drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]"
          >
            Seus baús
          </h1>
        </div>

        <section className="relative z-10">
          <ChestCarousel games={hall.games} uid={uid} lang={lang} />
        </section>

        {/* Loja - Sem callbacks manuais, props_change cuida de tudo */}
        <section className="relative z-30 mt-12">
          <ChestShop
            chests={hall.chests}
            games={hall.games}
            userProfile={hall.profile}
          />
        </section>
      </div>
    </div>
  );
}
